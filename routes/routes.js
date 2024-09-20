import { Router } from 'express';
import { uploadFile, getFile, deleteFile } from '../controllers/controller.js'
import { upload } from '../configs/multerConfig.js';

const fileRouter = Router();

fileRouter.post('/', upload.single('file'), uploadFile);
fileRouter.get('/:publicKey', getFile);
fileRouter.delete('/:privateKey', deleteFile);

export const FileRouter = fileRouter;