import express from 'express';
import { uploadImages, generatePrompt, generateImage } from '../controllers/imagesController.js';
import { generateTestImage } from '../controllers/testController.js';
import { verifyToken, adminOnly } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

// Configure multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Accept images and videos only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|mp4|MP4|webp|WEBP)$/)) {
      req.fileValidationError = 'Only image/video files are allowed!';
      return cb(new Error('Only image/video files are allowed!'), false);
    }
    cb(null, true);
  }
}).any(); // Use .any() to accept any field name

// Update route to handle multer errors
router.post('/', function(req, res, next) {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        message: "Upload error",
        error: err.message
      });
    } else if (err) {
      // An unknown error occurred when uploading
      return res.status(500).json({
        message: "Unknown upload error",
        error: err.message
      });
    }
    // Everything went fine, pass control to the controller
    uploadImages(req, res);
  });
});

router.post('/generate-prompt', generatePrompt);
router.post('/generate-image', generateImage);
router.post('/test-generate-image', generateTestImage);

export default router; 