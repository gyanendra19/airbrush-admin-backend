import dotenv from 'dotenv';

dotenv.config();

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Extract file information from Cloudinary response
    const uploadedFiles = req.files.map(file => ({
      url: file.path, // The URL of the uploaded file (Cloudinary secure URL)
      publicId: file.filename, // The public ID of the file in Cloudinary
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      fileType: file.mimetype.includes('video') ? 'video' : 'image'
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
}

export const generatePrompt = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `create a unique and professional single prompt of 15-20 words that will generate a beautiful image for ${categoryName}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();

    res.status(200).json({
      message: 'Prompt generated successfully',
      prompt: data
    });

  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ message: 'Error generating prompt', error: error.message });
  }
}

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const imageResponse = await fetch('https://api.deepinfra.com/v1/openai/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt.split('**Prompt:**')[1]?.trim() || prompt,
        size: "1024x1024",
        model: "black-forest-labs/FLUX-1-dev",
        n: 1,
        response_format: "b64_json"
      })
    });

    if (!imageResponse.ok) {
      throw new Error('Image generation failed');
    }

    const imageData = await imageResponse.json();
    
    // Return the base64 data directly
    res.status(200).json({
      message: 'Image generated successfully',
      imageData: imageData.data[0].b64_json
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ message: 'Error generating image', error: error.message });
  }
}
