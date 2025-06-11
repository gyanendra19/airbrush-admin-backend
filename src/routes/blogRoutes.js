import express from 'express';
import { getAllBlogPosts, getBlogPostById } from '../controllers/blogController.js';

const router = express.Router();

// Get all blog posts
router.get('/', getAllBlogPosts);

// Get a single blog post by ID
router.get('/:id', getBlogPostById);

export default router; 