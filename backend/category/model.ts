import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

// Define the interface for Category data
export interface CategoryDataType extends Document {
   publicId: string;
   name: string;
   slug: string;
   description: string;
   active: boolean;
   createdAt: Date;
   updatedAt: Date;
}

// Category schema definition
const categorySchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: uuidv4,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   slug: {
      type: String,
      required: false,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   name: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
   },
   description: {
      type: String,
      required: false,
      minLength: 1,
      maxLength: 1024, // Allows a longer description
   },
   active: {
      type: Boolean,
      required: true,
      default: true,
   },
   createdAt: {
      type: Date,
      required: true,
      default: new Date(),
   },
   updatedAt: {
      type: Date,
      required: true,
      default: new Date(),
   },
};

// Create the schema
export const CategorySchema: Schema = new Schema(
   categorySchemaDefinitions,
   {
      timestamps: true, // Automatically adds `createdAt` and `updatedAt`
      versionKey: false, // Disable `__v` field
      strict: false,     // Allows flexibility in document fields
   }
);

// Pre-save middleware to auto-generate and ensure unique slug
CategorySchema.pre("save", async function (next) {
   const category = this as unknown as CategoryDataType;

   // Auto-generate slug if not provided
   if (!category.slug) {
      category.slug = slugify(category.name, { lower: true });
   }

   // Ensure slug is unique
   const existingCategory = await mongoose.models.Category.findOne({ slug: category.slug });
   if (existingCategory && existingCategory._id.toString() !== category._id.toString()) {
      // If a duplicate slug exists, append a unique identifier
      category.slug = `${category.slug}-${uuidv4()}`;
   }

   next();
});

// Create the model
const CategoryModel = mongoose.model<CategoryDataType>("Category", CategorySchema);

export default CategoryModel;
