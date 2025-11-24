import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // unique filename: timestamp + original name
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const cloud_store = multer.memoryStorage();

export const upload = multer({ storage: cloud_store }); // storage:storage
