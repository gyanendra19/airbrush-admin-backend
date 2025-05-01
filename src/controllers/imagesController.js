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
