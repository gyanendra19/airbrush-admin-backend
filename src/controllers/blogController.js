import mongoose from 'mongoose';

// Get all blog posts
export const getAllBlogPosts = async (req, res) => {
    try {
        const collection = mongoose.connection.collection('blog-collection');
        const posts = await collection.find({}).toArray();
        
        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get a single blog post by ID
export const getBlogPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = mongoose.connection.collection('blog-collection');
        
        const post = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
