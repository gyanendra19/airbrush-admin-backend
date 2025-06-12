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

const metaExample = `<meta charset="UTF-8" /> 
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, 
user-scalable=no" /> 
<title>Convert JPG to HEIC Instantly | Free & Secure Online JPG to HEIC Converter - 
WriteCream AI</title> 
<meta name="description" content="Easily convert JPG to HEIC using WriteCream AI's free 
online converter. Fast, secure, no login needed. Optimize images for iPhone, Mac, and web 
storage." /> 
<meta name="keywords" content="Convert JPG to HEIC, JPG to HEIC converter, free JPG to 
HEIC tool, JPG to HEIC online, bulk JPG to HEIC, image converter for iPhone, convert images 
to HEIC, Mac optimized photo format, high-efficiency image converter, fast JPG to HEIC, JPG to 
HEIC free converter, writecream JPG to HEIC converter, online JPG to HEIC" /> 
<meta name="author" content="WriteCream AI" /> 
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, 
max-video-preview:-1" /> 
<meta name="language" content="English" /> 
<meta name="distribution" content="global" /> 
<meta name="rating" content="General" /> 
<meta name="revisit-after" content="7 days" /> 
<meta name="theme-color" content="#ffffff" /> 
<meta name="application-name" content="WriteCream AI JPG to HEIC Converter" /> 

<!-- Canonical --> 
<link rel="canonical" href="https://www.writecream.com/ultimate-jpg-to-heic-converter/" /> 

<!-- Favicons --> 
<link rel="icon" href="/favicon.ico" /> 
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /> 
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> 
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /> 

<!-- Open Graph / Facebook --> 
<meta property="og:type" content="website" /> 
<meta property="og:url" content="https://www.writecream.com/ultimate-jpg-to-heic-converter/" 
/> 
<meta property="og:title" content="Free JPG to HEIC Converter Online - Fast, Secure & No 
Signup" /> 
<meta property="og:description" content="Convert JPG images to HEIC format online in 
seconds. Free, secure & fast image conversion for iPhone and Mac by WriteCream AI." /> 
<meta property="og:image" 
content="https://www.writecream.com/wp-content/uploads/2025/03/jpg-heic.png" /> 
<meta property="og:site_name" content="WriteCream AI" /> 
<meta property="og:locale" content="en_US" /> 

<!-- Twitter Cards --> 
<meta name="twitter:card" content="summary_large_image" /> 
<meta name="twitter:url" content="https://www.writecream.com/ultimate-jpg-to-heic-converter/" 
/> 
<meta name="twitter:title" content="Convert JPG to HEIC - Free, Fast & Secure Online Tool by 
WriteCream AI" /> 
<meta name="twitter:description" content="Free online JPG to HEIC converter. Convert and 
compress your JPG photos to HEIC format with WriteCream AI — no login, no ads." /> 
<meta name="twitter:image" 
content="https://www.writecream.com/wp-content/uploads/2025/03/jpg-heic.png" /> 
<meta name="twitter:creator" content="@WriteCreamAI" /> 

<!-- Instagram (OG tags are used by Instagram when shared) --> 
<meta property="og:see_also" content="https://www.instagram.com/writecreamai/" /> 
<meta name="instagram:site" content="@writecreamai" /> 
<meta name="instagram:image" 
content="https://www.writecream.com/wp-content/uploads/2025/03/jpg-heic.png" /> 

<!-- Schema Markup (JSON-LD) --> 
<script type="application/ld+json"> 
{ 
  "@context": "https://schema.org", 
  "@type": "WebApplication", 
  "name": "JPG to HEIC Converter - WriteCream AI", 
  "url": "https://www.writecream.com/ultimate-jpg-to-heic-converter/", 
  "description": "WriteCream AI's JPG to HEIC Converter offers free, instant, secure conversion 
of JPG images to HEIC. Mobile-friendly, bulk supported, no login needed.", 
  "applicationCategory": "MultimediaApplication", 
  "operatingSystem": "All", 
  "offers": { 
    "@type": "Offer", 
    "price": "0.00", 
    "priceCurrency": "USD" 
  }, 
  "publisher": { 
    "@type": "Organization", 
    "name": "WriteCream AI", 
    "url": "https://www.writecream.com/" 
  }, 
  "aggregateRating": { 
    "@type": "AggregateRating", 
    "ratingValue": "4.9", 
"reviewCount": "1984" 
}} 
</script>`

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
        // Wait before retrying, with exponential backoff
        await delay(initialDelay * Math.pow(2, i));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Extract file information from Cloudinary response
    const uploadedFiles = req.files.map((file) => ({
      url: file.path, // The URL of the uploaded file (Cloudinary secure URL)
      publicId: file.filename, // The public ID of the file in Cloudinary
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      fileType: file.mimetype.includes("video") ? "video" : "image",
    }));

    res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ message: "Error uploading files", error: error.message });
  }
};

export const generatePrompt = async (req, res) => {
  try {
    const { categoryName, type } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    let text;
    if (type === "prompt") {
      text = `create a unique and professional single prompt of 15-20 words that will generate a beautiful image for ${categoryName}`;
    } else if (type === "meta") {
      text = `Rewrite the following meta tags using the category name ${categoryName}. Replace all instances of the original category name (e.g., "JPG to HEIC") with ${categoryName}. Do not add, remove, or modify any content other than replacing the category name. Use the exact structure and wording of the original tags. Meta tags: ${metaExample}`;
    } else if (type === "short_content") {
      text = `create a unique and professional short content of 70-100 words for ${categoryName}`;
    } else {
      text = `create a unique blog content of 350-400 words related to the topic ${categoryName}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini API request failed");
    }

    const data = await response.json();

    res.status(200).json({
      message: "Prompt generated successfully",
      prompt: data,
    });
  } catch (error) {
    console.error("Prompt generation error:", error);
    res
      .status(500)
      .json({ message: "Error generating prompt", error: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { 
      prompt, 
      format = 'webp', // webp provides better compression
      quality = 80,    // 0-100, lower means more compression
      compression = 6  // 0-9 for PNG compression level
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Clean the prompt if it contains the "**Prompt:**" prefix
    const cleanedPrompt = prompt.split("**Prompt:**")[1]?.trim() || prompt;

    const input = {
      prompt: cleanedPrompt,
      aspect_ratio: "1:1"  // You can make this configurable through req.body if needed
    };

    let output;
    try {
      output = await replicate.run("ideogram-ai/ideogram-v3-balanced", { input });
      console.log("Output URL:", output);
      
      if (!output) {
        throw new Error("No output received from Replicate");
      }
    } catch (error) {
      console.error("Replicate API error:", error);
      return res.status(500).json({
        message: "Error generating image with Replicate",
        error: error.message
      });
    }

    try {
      // Fetch the image with retry logic
      const response = await fetchWithRetry(output);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process the image with Sharp focusing on compression
      let sharpInstance = sharp(buffer);
      
      // Configure compression based on format
      switch(format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality,
            effort: 6, // 0-6, higher means better compression but slower
            lossless: false
          });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ 
            quality,
            effort: 6  // 0-9, higher means better compression but slower
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            compressionLevel: compression,
            effort: 10  // 1-10, higher means better compression but slower
          });
          break;
        default:
          sharpInstance = sharpInstance.webp({ quality }); // default to webp
      }

      const processedImageBuffer = await sharpInstance.toBuffer();
      const stats = await sharp(processedImageBuffer).stats();
      
      // Get original size for comparison
      const originalSize = buffer.length;
      const compressedSize = processedImageBuffer.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
      
      // Log detailed compression information
      console.log('\nImage Compression Details:');
      console.log('------------------------');
      console.log(`Format: ${format}`);
      console.log(`Original Size: ${(originalSize / 1024).toFixed(2)} KB`);
      console.log(`Compressed Size: ${(compressedSize / 1024).toFixed(2)} KB`);
      console.log(`Compression Ratio: ${compressionRatio}%`);
      console.log(`Space Saved: ${((originalSize - compressedSize) / 1024).toFixed(2)} KB`);
      console.log(`Quality Setting: ${quality}`);
      if (format.toLowerCase() === 'png') {
        console.log(`PNG Compression Level: ${compression}`);
      }
      console.log('------------------------\n');

      const base64String = processedImageBuffer.toString('base64');
      const mimeType = `image/${format.toLowerCase()}`;

      res.status(200).json({
        message: "Image generated and compressed successfully",
        imageData: `data:${mimeType};base64,${base64String}`,
        stats: {
          format,
          originalSize: originalSize,
          compressedSize: compressedSize,
          compressionRatio: `${compressionRatio}%`,
          quality,
          channels: stats.channels,
          isOpaque: stats.isOpaque
        }
      });
    } catch (error) {
      console.error("Error processing generated image:", error);
      // If we at least have the output URL, return it
      res.status(500).json({
        message: "Error processing generated image",
        error: error.message,
        imageUrl: output // Return the URL in case frontend wants to try fetching directly
      });
    }
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      message: "Error generating image",
      error: error.message
    });
  }
};
