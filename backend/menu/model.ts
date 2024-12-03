import mongoose, { type Document, type Model,  Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

// Define the static methods interface
interface MenuModelStatics extends Model<MenuDataType> {
   softDelete(id: string): Promise<MenuDataType | null>;
   restore(id: string): Promise<MenuDataType | null>;
   findDeleted(query?: Record<string, any>): Promise<MenuDataType[]>;
}

export interface MenuDataType extends Document {
   publicId: string;
   name: string;
   slug: string;
   categoryId: string;
   image: string;
   price: number;
   createdAt: Date;
   available: boolean;
   updatedAt: Date;
   parent: string;
   isDeleted: boolean;
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
      type: String,
      ref: 'Category',
      required: true,
      validate: {
         validator: async (value: string) => {
            console.log(value,"Category value");
            const category = await mongoose.model('Category').findOne({
               publicId: value,
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
   isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      select: false // Hide by default in queries
   },
   deletedAt: {
      type: Date,
      required: false,
      select: false // Hide by default in queries
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



MenuSchema.statics.softDelete = async function(id: string) {
   const updatedMenu = await this.findOneAndUpdate(
      { publicId: id },
      {
         isDeleted: true,
         deletedAt: new Date(),
         available: false // Automatically make unavailable when deleted
      },
      { new: true }
   );
   return updatedMenu;
};

// Add method to restore deleted items
MenuSchema.statics.restore = async function(id: string) {
   const restoredMenu = await this.findOneAndUpdate(
      { publicId: id },
      {
         isDeleted: false,
         deletedAt: null,
         available: true // Optionally restore availability
      },
      { new: true }
   );
   return restoredMenu;
};

// Add method to find deleted items
MenuSchema.statics.findDeleted = async function(query = {}) {
   return this.find({ ...query, isDeleted: true });
};
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


const MenuModel = mongoose.model<MenuDataType, MenuModelStatics>("Menu", MenuSchema);

export default MenuModel;