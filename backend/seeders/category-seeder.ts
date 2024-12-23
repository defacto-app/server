import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { connectDB } from "../../config/mongodb";
import CategoryModel from "../admin/restaurant/category/model";
import { RESTAURANT_CATEGORIES, MENU_CATEGORIES } from "./data";

function generateUniqueSlug(name: string): string {
   const baseSlug = slugify(name, { lower: true, strict: true });
   const uniqueSuffix = uuidv4().slice(0, 6);
   return `${baseSlug}-${uniqueSuffix}`;
}

export async function seedCategories() {
   console.log("Seeding categories...");
   try {
      await connectDB();

      // Clear existing categories
      await CategoryModel.deleteMany({});
      console.log("Cleared existing categories");

      // Generate restaurant categories
      const restaurantCategories = RESTAURANT_CATEGORIES.map((name) => ({
         publicId: uuidv4(),
         name,
         slug: generateUniqueSlug(name),
         description: `${name} category for restaurants`,
         active: true,
         categoryType: "restaurant", // Set as 'restaurant' type
         createdAt: new Date(),
         updatedAt: new Date(),
      }));

      // Generate menu categories
      const menuCategories = MENU_CATEGORIES.map((name) => ({
         publicId: uuidv4(),
         name,
         slug: generateUniqueSlug(name),
         description: `${name} category for menu items`,
         active: true,
         categoryType: "menu", // Set as 'menu' type
         createdAt: new Date(),
         updatedAt: new Date(),
      }));

      // Combine categories
      const allCategories = [...restaurantCategories, ...menuCategories];

      // Insert categories into the database
      const savedCategories = await CategoryModel.insertMany(allCategories);
      console.log(`Seeded ${savedCategories.length} categories successfully!`);
   } catch (error) {
      console.error("Error during category seeding:", error);
      throw error;
   }
}


seedCategories()