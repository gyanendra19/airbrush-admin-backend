import mongoose from "mongoose";

// Define a schema for the content fields
const ContentFieldSchema = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    key: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
    },
    lead: {
      type: Boolean,
    },
    content: {
      type: String,
    },
    blogdate: {
      type: String,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const ContentSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        alt: String,
        title: String,
        prompt: String,
        width: Number,
        height: Number,
        order: Number,
      },
    ],
    fields: [ContentFieldSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// // Create compound index to ensure uniqueness within a section
// ContentSchema.index({ section: 1 }, { unique: true });

// // Create compound index to ensure slug uniqueness within a category
// ContentSchema.index(
//   { "section.category": 1, slug: 1 },
//   { unique: true, sparse: true }
// );

// // Pre-save hook to generate slug if not provided
// ContentSchema.pre("save", async function (next) {
//   try {
//     // If slug is not provided and title exists, generate from title
//     if (!this.slug && this.title) {
//       this.slug = this.title
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, "-")
//         .replace(/(^-|-$)/g, "");

//       // If section is populated, we can check for duplicate slugs within the category
//       if (this.populated("section") && this.section?.category) {
//         const category = this.section.category;

//         // Check if this slug already exists in this category
//         let slugExists = true;
//         let counter = 0;
//         let newSlug = this.slug;

//         while (slugExists && counter < 100) {
//           // Find sections in the same category
//           const sectionsInCategory = await mongoose
//             .model("Section")
//             .find({ category });

//           // Get IDs of all these sections
//           const sectionIds = sectionsInCategory.map((s) => s._id);

//           // Check if any content with this slug exists for any section in the category
//           const existingContent = await mongoose.model("Content").findOne({
//             section: { $in: sectionIds },
//             slug: newSlug,
//             _id: { $ne: this._id }, // Exclude current document
//           });

//           if (existingContent) {
//             counter++;
//             newSlug = `${this.slug}-${counter}`;
//           } else {
//             slugExists = false;
//             this.slug = newSlug;
//           }
//         }
//       }
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

export default mongoose.model("Content", ContentSchema);
