import { generateRandomString } from '../utilities/utility.js'
import FileInfo from '../models/file_infos.js';
import path from 'path';
import fs from 'fs/promises';

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
        await FileInfo.create({
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
  try {
    const { publicKey } = req.params;

    // Ensure the publicKey is provided
    if (!publicKey) {
        return res.status(400).json({ message: 'publicKey is not provided' });
    }

    // Find the file information from the database by publicKey
    const fileInfo = await FileInfo.findOne({ where: { publicKey } });

    // If fileInfo is not found, return an error response
    if (!fileInfo) {
        return res.status(404).json({ message: 'Wrong publicKey given' });
    }

    // Extract the filePath from the record
    const filePath = fileInfo.filePath;

    // Check if the file exists at the filePath
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
    }

    // Send the file as a response for download
    return res.download(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error in file download', error: err.message });
        }
    });
  } catch (error) {
      // Catch any unexpected errors and return a server error response
      console.error(error);
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFile = async (req, res, next,) => {
  try {
    const { privateKey } = req.params;

    // Ensure the privateKey is provided
    if (!privateKey) {
        return res.status(400).json({ message: 'privateKey is not provided' });
    }

    // Find the file information from the database by privateKey
    const fileInfo = await FileInfo.findOne({ where: { privateKey } });

    // If fileInfo is not found, return an error response
    if (!fileInfo) {
        return res.status(404).json({ message: 'Wrong privateKey given' });
    }

    // Extract the filePath from the record
    const filePath = fileInfo.filePath;

    // Check if the file exists at the filePath
    try {
        await fs.access(filePath); // Check if the file exists
    } catch (err) {
        return res.status(404).json({ message: 'File not found on server' });
    }

    // Attempt to delete the file from the file system
    try {
        await fs.unlink(filePath); // Delete the file asynchronously

        // After file deletion, delete the record from the database
        await fileInfo.destroy();

        // Send a success response
        return res.status(200).json({ message: 'File deleted successfully!' });
    } catch (err) {
        // Handle any error that occurs during file deletion or DB operation
        return res.status(500).json({ message: 'Error deleting the file or record', error: err.message });
    }
  } catch (error) {
      // Catch any unexpected errors and return a server error response
      console.error(error);
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
};