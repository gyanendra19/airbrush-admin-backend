import Category from '../models/Category.js';

// Get all root categories
export const getCategories = async (req, res) => {
  try {
    const { parentId } = req.query;
    
    let query = {};
    if (parentId) {
      query.parent = parentId;
    } else {
      query.parent = null; // Root categories
    }
    
    const categories = await Category.find(query).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get child categories if it's a folder
    let children = [];
    if (category.isFolder) {
      children = await Category.find({ parent: category._id }).sort({ name: 1 });
    }
    
    res.status(200).json({
      ...category._doc,
      children
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { parentSlug, slug } = req.params;
    
    let query = { slug };
    
    // If parentSlug is provided, find the parent first
    if (parentSlug) {
      const parentCategory = await Category.findOne({ slug: parentSlug });
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
      query.parent = parentCategory._id;
    } else {
      query.parent = null; // Root level category
    }
    
    const category = await Category.findOne(query);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get child categories if it's a folder
    let children = [];
    if (category.isFolder) {
      children = await Category.find({ parent: category._id }).sort({ name: 1 });
    }
    
    res.status(200).json({
      ...category._doc,
      children
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, parent, isFolder } = req.body;
    
    // Check if parent exists if provided
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
      if (!parentExists.isFolder) {
        return res.status(400).json({ message: 'Parent must be a folder' });
      }
    }
    
    // Check if category with same name or slug exists at the same level
    const existingCategory = await Category.findOne({
      parent: parent || null,
      $or: [
        { name },
        { slug: slug || name.toLowerCase().replace(/\s+/g, '-') }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name or slug already exists at this level' });
    }
    
    const newCategory = new Category({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      image,
      parent: parent || null,
      isFolder: isFolder !== undefined ? isFolder : true
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, parent, isFolder, isActive } = req.body;
    
    // If parent is being updated, check if it exists
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
      if (!parentExists.isFolder) {
        return res.status(400).json({ message: 'Parent must be a folder' });
      }
      
      // Check for circular reference
      if (parent === req.params.id) {
        return res.status(400).json({ message: 'A category cannot be its own parent' });
      }
    }
    
    // Get current category
    const currentCategory = await Category.findById(req.params.id);
    if (!currentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if name or slug already exists at the same level
    if (name || slug) {
      const newSlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : currentCategory.slug);
      
      const existingCategory = await Category.findOne({
        _id: { $ne: req.params.id },
        parent: parent || currentCategory.parent,
        $or: [
          { name: name || currentCategory.name },
          { slug: newSlug }
        ]
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name or slug already exists at this level' });
      }
    }
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (parent !== undefined) updateData.parent = parent || null;
    if (isFolder !== undefined) updateData.isFolder = isFolder;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    // Check if category has children
    const childCategories = await Category.find({ parent: req.params.id });
    if (childCategories.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Delete subcategories first or move them.',
        childCount: childCategories.length
      });
    }
    
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 