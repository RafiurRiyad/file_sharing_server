import FileInfo from '../models/file_infos.js';
import sinon from 'sinon';
import fs from 'fs';
import { expect } from 'chai';
import { uploadFile, getFile, deleteFile } from '../controllers/controller.js';

describe('uploadFile Route - Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should save the file information in the database', async () => {
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
});


describe('getFile Route - Unit Test', () => {
  afterEach(() => {
    sinon.restore(); // Restore the default sandbox after each test
  });

  it('should return the file if the publicKey matches', async () => {
    const req = { query: { publicKey: 'validPublicKey' } };
    const res = {
      sendFile: sinon.spy(),
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'findOne').resolves({
      filePath: '/uploads/file.txt',
    });

    await getFile(req, res);

    expect(res.sendFile.calledWith('/uploads/file.txt')).to.be.true;
  });

  it('should return an error if the publicKey does not match', async () => {
    const req = { query: { publicKey: 'invalidPublicKey' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'findOne').resolves(null);

    await getFile(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid public key' })).to.be.true;
  });
});

describe('deleteFile Route - Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete the file if privateKey matches', async () => {
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

  it('should return an error if the privateKey does not match', async () => {
    const req = { params: { privateKey: 'invalidPrivateKey' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(FileInfo, 'findOne').resolves(null);

    await deleteFile(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid private key' })).to.be.true;
  });
});
