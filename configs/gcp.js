import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Cloud configuration
const storage = new Storage({
  projectId: 'gcp-project-id', // Replace with Google Cloud Project ID
  keyFilename: path.join(__dirname, 'gcp-service-account-file.json'), // Path to gcp service account file
});

const bucketName = 'gcp-bucket-name'; // Replace with Google Cloud Storage bucket name

export const bucket = storage.bucket(bucketName);
