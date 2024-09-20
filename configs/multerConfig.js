import multer from "multer";
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: function(req, file, cb){
      const uploadDir = 'uploads/';
      
      // Check if the directory exists, if not, create it
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
      }
  
      cb(null, uploadDir); // Set the upload directory
    },
    filename: function(req, file, cb){
      cb(null, file.fieldname + "-" + file.originalname + path.extname(file.originalname))
    }
  })
  
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept the file
  }
});