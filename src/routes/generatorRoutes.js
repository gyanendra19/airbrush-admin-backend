import express from 'express';
import { getAllGenerators, getGeneratorById } from '../controllers/generatorController.js';
import { testCompression } from '../controllers/imagesController.js';

const router = express.Router();

// Get all generators
router.get('/', getAllGenerators);

// Get a single generator by ID
router.get('/:id', getGeneratorById);

// Test compression settings
router.post('/test-compression', testCompression);

export default router; 