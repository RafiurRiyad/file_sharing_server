import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import FileInfo from '../models/file_info.js'; 
const UPLOAD_DIR = 'uploads/'; 

// Schedule the task to run once every 7 days
cron.schedule('0 0 * * 0', async () => {
  try {
    console.log("Starting scheduled file cleanup...");
    // Read all files from the upload directory
    const files = await fs.readdir(UPLOAD_DIR);
    // Fetch all files stored in the database
    const dbFiles = await FileInfo.findAll({
      attributes: ['filePath']
    });
    // Create a Set of all file paths from the database for easy lookup
    const dbFilePaths = new Set(dbFiles.map(file => path.normalize(file.filePath)));
    // Iterate over the files in the uploads directory
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      // Check if the current file is in the database
      if (!dbFilePaths.has(path.normalize(filePath))) {
        // If file is not in the database, delete it
        try {
          await fs.unlink(filePath);
          console.log(`Deleted unlinked file: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting file: ${filePath}, error: ${err.message}`);
        }
      }
    }
    console.log("Scheduled file cleanup completed.");
  } catch (error) {
    console.error("Error in scheduled file cleanup:", error);
  }
});