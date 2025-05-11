import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Import routes
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import imagesRoute from './routes/imagesRoute.js';
// Configure environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
const DB = process.env.MONGO_URL;
mongoose.connect(DB)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/images', imagesRoute);


const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});