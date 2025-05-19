import dotenv from "dotenv";

dotenv.config();

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
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const imageResponse = await fetch(
      "https://api.deepinfra.com/v1/openai/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: prompt.split("**Prompt:**")[1]?.trim() || prompt,
          size: "1024x1024",
          model: "black-forest-labs/FLUX-1-dev",
          n: 1,
          response_format: "b64_json",
        }),
      }
    );

    if (!imageResponse.ok) {
      throw new Error("Image generation failed");
    }

    const imageData = await imageResponse.json();

    // Return the base64 data directly
    res.status(200).json({
      message: "Image generated successfully",
      imageData: imageData.data[0].b64_json,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    res
      .status(500)
      .json({ message: "Error generating image", error: error.message });
  }
};
