import express from 'express';
import { uploadImages } from '../controllers/imagesController.js';
import { verifyToken, adminOnly } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'airbrush-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    format: 'jpg',
    resource_type: 'auto'
  }
});

const upload = multer({ storage: storage });
router.post('/', upload.array('images', 10), uploadImages);

export default router; 