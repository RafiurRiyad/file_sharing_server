import crypto from 'crypto';

// Function to generate a random 32-character string
export const generateRandomString = () => {
    return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 characters in hex
  };