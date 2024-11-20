import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

export interface MenuDataType extends Document {
   publicId: string;
   name: string;
   slug: string;
   categoryId: mongoose.Types.ObjectId;
   image: string;
   price: number;
   createdAt: Date;
   available: boolean;
   updatedAt: Date;
   parent: string;
}

const menuSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: uuidv4,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   parent: {
      type: String,
      required: true,
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
   categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      validate: {
         validator: async (value: mongoose.Types.ObjectId) => {
            const category = await mongoose.model('Category').findOne({
               _id: value,
               categoryType: 'menu',
               active: true
            });
            return !!category;
         },
         message: 'Category must exist and be an active menu category'
      }
   },
   image: {
      type: String,
      required: false,
      default: "https://placehold.co/600x400.png",
   },
   available: {
      type: Boolean,
      required: true,
      default: true,
   },
   price: {
      type: Number,
      required: true,
      min: 0,
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

export const MenuSchema: Schema = new Schema(menuSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

// Pre-save middleware to auto-generate and ensure unique slug
MenuSchema.pre("save", async function (next) {
   const menu = this as unknown as MenuDataType;

   // Auto-generate slug if not provided
   if (!menu.slug) {
      menu.slug = slugify(menu.name, { lower: true });
   }

   // Ensure slug is unique
   const existingMenu = await mongoose.models.Menu.findOne({ slug: menu.slug });
   if (existingMenu && existingMenu._id.toString() !== menu._id.toString()) {
      // If a duplicate slug exists, append a unique identifier
      menu.slug = `${menu.slug}-${uuidv4()}`;
   }

   next();
});

// Add method to calculate discounted price
MenuSchema.methods.calculateDiscountedPrice = function (discountPercent: number) {
   return this.price * (1 - discountPercent / 100);
};

// Add indexes for frequently queried fields
MenuSchema.index({ slug: 1, parent: 1 });
MenuSchema.index({ categoryId: 1 }); // Updated to use categoryId instead of category

const MenuModel = mongoose.model<MenuDataType>("Menu", MenuSchema);

export default MenuModel;