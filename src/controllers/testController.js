import dotenv from "dotenv";
import Replicate from "replicate";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import fetch from "node-fetch";
import { Readable } from 'stream';
import { finished } from 'stream/promises';

dotenv.config();

// Add a check for the API key
if (!process.env.REPLICATE_API_KEY) {
  throw new Error("REPLICATE_API_KEY is not set in environment variables");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Helper function to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retry
async function fetchWithRetry(url, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        timeout: 15000 // 15 seconds timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      lastError = error;
      
      if (i < maxRetries - 1) {
        await delay(initialDelay * Math.pow(2, i));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// Helper function to download and save image
async function downloadImage(url, filename) {
  const response = await fetchWithRetry(url);
  const filePath = path.join(uploadsDir, filename);
  const fileStream = createWriteStream(filePath);
  await finished(Readable.from(Buffer.from(await response.arrayBuffer())).pipe(fileStream));
  return filePath;
}

// Helper function to generate a single image
async function generateSingleImage(prompt, index) {
  try {
    const input = {
      prompt: prompt,
      aspect_ratio: "9:16"
    };

    const output = await replicate.run("ideogram-ai/ideogram-v3-turbo", { input });
    
    if (!output) {
      throw new Error("No output received from Replicate");
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `generated_${timestamp}_${index}.png`;
    
    // Download and save the image locally
    const savedFilePath = await downloadImage(output, filename);

    return {
      success: true,
      prompt,
      filePath: savedFilePath,
      originalUrl: output
    };
  } catch (error) {
    console.error(`Error generating image for prompt "${prompt}":`, error);
    return {
      success: false,
      prompt,
      error: error.message
    };
  }
}

export const generateTestImage = async (req, res) => {
  try {
    const { prompts } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ 
        message: "Prompts array is required and must not be empty",
        example: {
          prompts: [
            "first prompt",
            "second prompt",
            "third prompt",
            "fourth prompt",
            "fifth prompt",
            "sixth prompt",
            "seventh prompt",
            "eighth prompt",
            "ninth prompt",
            "tenth prompt",
            "eleventh prompt",
            "twelfth prompt"
          ]
        }
      });
    }

    if (prompts.length > 12) {
      return res.status(400).json({ 
        message: "Maximum 12 prompts allowed at once" 
      });
    }

    // Generate all images concurrently
    const results = await Promise.all(
      prompts.map((prompt, index) => generateSingleImage(prompt, index))
    );

    // Separate successful and failed generations
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    res.status(200).json({
      message: "Image generation completed",
      totalRequested: prompts.length,
      successfulCount: successful.length,
      failedCount: failed.length,
      successful: successful.map(({ prompt, filePath, originalUrl }) => ({
        prompt,
        filePath,
        originalUrl
      })),
      failed: failed.map(({ prompt, error }) => ({
        prompt,
        error
      }))
    });

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      message: "Error in batch image generation",
      error: error.message
    });
  }
};
