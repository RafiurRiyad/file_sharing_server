import sinon from 'sinon';
import { expect } from 'chai';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import { uploadFile, getFile, deleteFile } from '../controllers/controller.js';
import FileInfo from '../models/file_infos.js';
import { AppConfig } from '../config.js';

const mockGCPBucket = {
  file: () => ({
    delete: sinon.stub().resolves(true),
  }),
};

// Unit test for uploadFile
describe('uploadFile Route - Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should save the file information in the database (local)', async () => {
    sinon.stub(AppConfig, 'provider').value('local');
    const req = {
      file: {
        filename: 'testfile.txt',
        path: '/uploads/testfile.txt',
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'create').resolves({
      fileName: 'testfile.txt',
      filePath: '/uploads/testfile.txt',
      publicKey: 'testPublicKey',
      privateKey: 'testPrivateKey',
    });

    await uploadFile(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message: 'File uploaded successfully' })).to.be.true;
  });

  it('should save the file information in the database (google)', async () => {
    sinon.stub(AppConfig, 'provider').value('google');
    sinon.stub(Storage.prototype, 'bucket').returns(mockGCPBucket);

    const req = {
      file: {
        filename: 'testfile.txt',
        path: 'https://gcp-bucket/testfile.txt',
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'create').resolves({
      fileName: 'testfile.txt',
      filePath: 'https://gcp-bucket/testfile.txt',
      publicKey: 'testPublicKey',
      privateKey: 'testPrivateKey',
    });

    await uploadFile(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message: 'File uploaded successfully' })).to.be.true;
  });
});

// Unit test for deleteFile
describe('deleteFile Route - Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete the file if privateKey matches (local)', async () => {
    sinon.stub(AppConfig, 'provider').value('local');
    const req = { params: { privateKey: 'validPrivateKey' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: '/uploads/file.txt',
      destroy: sinon.spy(),
    });
    sinon.stub(fs, 'unlinkSync').returns(true);

    await deleteFile(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'File deleted successfully' })).to.be.true;
  });

  it('should delete the file from GCP if privateKey matches (google)', async () => {
    sinon.stub(AppConfig, 'provider').value('google');
    const req = { params: { privateKey: 'validPrivateKey' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: 'https://gcp-bucket/file.txt',
      destroy: sinon.spy(),
    });
    sinon.stub(Storage.prototype, 'bucket').returns(mockGCPBucket);

    await deleteFile(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'File deleted successfully from gcp' })).to.be.true;
  });
});
