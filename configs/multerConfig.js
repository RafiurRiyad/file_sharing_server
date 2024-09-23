import multer from "multer";
import path from 'path';
import fs from 'fs';
import { AppConfig } from './config.js';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid'; // To generate unique file names

const { provider } = AppConfig;

// Configure Google Cloud Storage if provider is 'google'
const storage = provider === 'google' ? new Storage({
  keyFilename: 'path/to/gcp/service-account-file.json', // Path to Google Cloud service account key file
  projectId: 'gcp-project-id', // Google Cloud project ID
}) : null;

const bucketName = 'gcp-google-cloud-bucket-name';

// Multer storage for local uploads
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
    }

    cb(null, uploadDir); // Set the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + file.originalname + path.extname(file.originalname));
  }
});

// Upload function for Google Cloud Storage
const gcpUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(`${uuidv4()}-${req.file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    gzip: true,
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobStream.on('error', (err) => {
    console.error('Upload error:', err);
    next(err);
  });

  blobStream.on('finish', async () => {
    await blob.makePublic(); // Make the file publicly accessible
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
    req.file.gcpUrl = publicUrl; // Store the GCP URL in the request object
    next();
  });

  blobStream.end(req.file.buffer);
};

export const upload = (req, res, next) => {
  if (provider === 'local') {
    // Use local multer storage
    const localUpload = multer({
      storage: localStorage,
      limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB file size limit
      },
      fileFilter: (req, file, cb) => {
        cb(null, true); // Accept the file
      }
    }).single('file');

    // Call the local upload middleware
    localUpload(req, res, next);
  } else if (provider === 'google') {
    // Use memory storage with multer for GCP upload
    const memoryUpload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB file size limit
      },
      fileFilter: (req, file, cb) => {
        cb(null, true); // Accept the file
      }
    }).single('file');

    // Call memory upload middleware, followed by GCP upload logic
    memoryUpload(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: 'File upload failed', error: err });
      }
      gcpUpload(req, res, next); // Handle GCP upload
    });
  } else {
    // If provider is not recognized
    res.status(500).json({ message: 'Invalid provider configuration' });
  }
};
