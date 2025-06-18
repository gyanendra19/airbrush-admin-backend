import express from 'express';
import { getAllBlogPosts, getBlogPostByUrl } from '../controllers/blogController.js';

const router = express.Router();

// Get all blog posts
router.get('/', getAllBlogPosts);

// Get a single blog post by ID
router.get('/:url', getBlogPostByUrl);

export default router; 