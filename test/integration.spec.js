import express from 'express';
import request from 'supertest';
import sinon from 'sinon';
import fs from 'fs';
import { expect } from 'chai';
import { Storage } from '@google-cloud/storage';
import FileInfo from '../models/file_infos.js';
import { AppConfig } from '../config.js';

const app = express();
const mockGCPBucket = {
  file: () => ({
    delete: sinon.stub().resolves(true),
  }),
};

// Integration test for upload route
describe('POST /upload - Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should upload a file and save it in the database (local)', async () => {
    sinon.stub(FileInfo, 'create').resolves({
      fileName: 'testfile.txt',
      filePath: '/uploads/testfile.txt',
      publicKey: 'testPublicKey',
      privateKey: 'testPrivateKey',
    });

    const response = await request(app)
      .post('/upload')
      .attach('file', './testfile.txt') // Attach file to simulate upload
      .field('publicKey', 'testPublicKey')
      .field('privateKey', 'testPrivateKey');

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('File uploaded successfully');
  });

  it('should upload a file to Google Cloud and save it in the database (google)', async () => {
    sinon.stub(AppConfig, 'provider').value('google'); // Simulate Google provider
    sinon.stub(Storage.prototype, 'bucket').returns(mockGCPBucket);

    sinon.stub(FileInfo, 'create').resolves({
      fileName: 'testfile.txt',
      filePath: 'https://gcp-bucket/testfile.txt',
      publicKey: 'testPublicKey',
      privateKey: 'testPrivateKey',
    });

    const response = await request(app)
      .post('/upload')
      .attach('file', './testfile.txt')
      .field('publicKey', 'testPublicKey')
      .field('privateKey', 'testPrivateKey');

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('File uploaded successfully');
  });
});

// Integration test for file retrieval
describe('GET /file - Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return the file if publicKey is valid (local)', async () => {
    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: '/uploads/testfile.txt',
    });

    const response = await request(app)
      .get('/file')
      .query({ publicKey: 'validPublicKey' });

    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.include('application/octet-stream');
  });

  it('should return the file if publicKey is valid (google)', async () => {
    sinon.stub(AppConfig, 'provider').value('google');
    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: 'https://gcp-bucket/testfile.txt',
    });

    const response = await request(app)
      .get('/file')
      .query({ publicKey: 'validPublicKey' });

    expect(response.status).to.equal(302); // Redirect for GCP
  });
});

// Integration test for delete route
describe('DELETE /file - Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete a file if privateKey is valid (local)', async () => {
    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: '/uploads/testfile.txt',
      destroy: sinon.spy(),
    });
    sinon.stub(fs, 'unlinkSync').returns(true);

    const response = await request(app).delete('/file/validPrivateKey');

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('File deleted successfully');
  });

  it('should delete a file from GCP if privateKey is valid (google)', async () => {
    sinon.stub(AppConfig, 'provider').value('google');
    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: 'https://gcp-bucket/testfile.txt',
      destroy: sinon.spy(),
    });
    sinon.stub(Storage.prototype, 'bucket').returns(mockGCPBucket);

    const response = await request(app).delete('/file/validPrivateKey');

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('File deleted successfully from gcp');
  });
});
