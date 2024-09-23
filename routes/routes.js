import { Router } from 'express';
import { uploadFile, getFile, deleteFile } from '../controllers/controller.js'
import { upload } from '../configs/multerConfig.js';
import limiter from '../configs/rateLimiter.js';

const fileRouter = Router();

fileRouter.post('/', limiter, upload, uploadFile);
fileRouter.get('/:publicKey', limiter, getFile);
fileRouter.delete('/:privateKey', deleteFile);

export const FileRouter = fileRouter;