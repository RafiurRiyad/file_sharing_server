import { generateRandomString } from '../utilities/utility.js'
import FileInfo from '../models/file_info.js';

export const uploadFile = async (req, res, next,) => {
    try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        // Extract file information
        const fileName = req.file.filename;
        const filePath = req.file.path; 

        // Generate public and private keys randomly
        const publicKey = generateRandomString();
        const privateKey = generateRandomString();
    
        // Save file information to the database using Sequelize
        const newFile = await FileInfo.create({
            fileName,
            filePath,
            publicKey,
            privateKey
        });

        // Send the keys as response
        res.json({
          message: 'File uploaded successfully!',
          publicKey,
          privateKey
        });
      } catch (error) {
        console.error('Error handling upload:', error);
        res.status(500).json(
            {
                message: 'Internal server error'
            });
    }
};

export const getFile = async (req, res, next,) => {
    //
};

export const deleteFile = async (req, res, next,) => {
    //
};