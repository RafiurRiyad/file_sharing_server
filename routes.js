import { Router } from 'express';
import { uploadFile, getFile, deleteFile } from './controller.js'

const fileRouter = Router();

fileRouter.post('/', uploadFile);
fileRouter.get('/:publicKey', getFile);
fileRouter.delete('/:privateKey', deleteFile);

export const FileRouter = fileRouter;