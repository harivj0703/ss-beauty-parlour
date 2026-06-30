import multer from 'multer';
import { Request } from 'express';

const memStorage = multer.memoryStorage();

const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
  }
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const profileUpload = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
}).single('avatar');

export const serviceUpload = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
}).array('images', 5);

export const galleryUpload = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
}).single('image');

export const blogUpload = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
}).single('coverImage');

export const singleUpload = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
}).single('image');
