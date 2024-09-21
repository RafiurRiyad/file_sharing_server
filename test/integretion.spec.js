import express from 'express';
import request from 'supertest';
import sinon from 'sinon';
import fs from 'fs';
import { expect } from 'chai';
import FileInfo from '../models/file_infos.js';


const app = express();

describe('POST /upload - Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should upload a file and save it in the database', async () => {
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
});

describe('GET /file - Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return the file if publicKey is valid', async () => {
    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: '/uploads/testfile.txt',
    });

    const response = await request(app)
      .get('/file')
      .query({ publicKey: 'validPublicKey' });

    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.include('application/octet-stream');
  });

  it('should return 404 if publicKey is invalid', async () => {
    sinon.stub(FileInfo, 'findOne').resolves(null);

    const response = await request(app)
      .get('/file')
      .query({ publicKey: 'invalidPublicKey' });

    expect(response.status).to.equal(404);
    expect(response.body.error).to.equal('Invalid public key');
  });
});

describe('DELETE /file - Integration Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete a file if privateKey is valid', async () => {
    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: '/uploads/testfile.txt',
      destroy: sinon.spy(),
    });
    sinon.stub(fs, 'unlinkSync').returns(true);

    const response = await request(app).delete('/file/validPrivateKey');

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('File deleted successfully');
  });

  it('should return 404 if privateKey is invalid', async () => {
    sinon.stub(FileInfo, 'findOne').resolves(null);

    const response = await request(app).delete('/file/invalidPrivateKey');

    expect(response.status).to.equal(404);
    expect(response.body.error).to.equal('Invalid private key');
  });
});
