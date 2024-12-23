import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import { v4 as uuidv4 } from "uuid";
import Chance from "chance";
import RestaurantModel from "../restaurant/model";
import CategoryModel from "../admin/restaurant/category/model";
import MenuModel from "../menu/model";
import slugify from "slugify";
import { menuItemsByCategory } from "./data";

const chance = new Chance();

interface SeedMenuOptions {
   minItemsPerRestaurant?: number;
   maxItemsPerRestaurant?: number;
   clearExisting?: boolean;
}

async function generateUniqueSlug(
   name: string,
   restaurantId: string
): Promise<string> {
   const baseSlug = slugify(name, { lower: true, strict: true });
   const uniqueSlug = `${baseSlug}-${restaurantId.slice(0, 6)}-${uuidv4().slice(0, 4)}`;
   return uniqueSlug;
}

async function seedMenus({
   minItemsPerRestaurant = 5,
   maxItemsPerRestaurant = 15,
   clearExisting = true,
}: SeedMenuOptions = {}) {
   console.time("Menu seeding time");

   try {
      await connectDB();
      console.log("Connected to database");

      // Fetch required data
      const restaurants = await RestaurantModel.find({});
      const categories = await CategoryModel.find({ categoryType: "menu" });

      if (!restaurants.length) throw new Error("No restaurants found. Please seed restaurants first.");
      if (!categories.length) throw new Error("No menu categories found. Please seed categories first.");

      if (clearExisting) {
         await MenuModel.deleteMany({});
         console.log("Cleared existing menu items");
      }

      const menuItems = [];
      let totalProcessed = 0;

      for (const restaurant of restaurants) {
         const numItems = chance.integer({ min: minItemsPerRestaurant, max: maxItemsPerRestaurant });

         for (let i = 0; i < numItems; i++) {
            const randomCategory = chance.pickone(categories);
            const categoryName = randomCategory.name;

            // Get food items for the category
            const foodItems = menuItemsByCategory[categoryName] || menuItemsByCategory[categoryName.toLowerCase()];

            if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
               console.warn(`No predefined items for category: ${categoryName}`);
               continue;
            }

            // Pick a random food item
            const foodItem = chance.pickone(foodItems);

            const menuItem = {
               publicId: uuidv4(),
               name: foodItem.name,
               description: foodItem.description,
               slug: await generateUniqueSlug(foodItem.name, restaurant.publicId),
               categoryId: randomCategory.publicId,
               image: `https://placehold.co/600x400.png?text=${encodeURIComponent(foodItem.name)}`,
               price: foodItem.price,
               available: chance.bool(),
               parent: restaurant.publicId,
               createdAt: new Date(),
               updatedAt: new Date(),
            };

            menuItems.push(menuItem);
            totalProcessed++;

            // Log progress every 100 items
            if (totalProcessed % 100 === 0) {
               console.log(`Processed ${totalProcessed} menu items...`);
            }
         }
      }

      // Insert in batches
      const BATCH_SIZE = 1000;
      for (let i = 0; i < menuItems.length; i += BATCH_SIZE) {
         const batch = menuItems.slice(i, i + BATCH_SIZE);
         await MenuModel.insertMany(batch);
         console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(menuItems.length / BATCH_SIZE)}`);
      }

      console.log("\nSeeding Summary:");
      console.log("-----------------");
      console.log(`Total Restaurants Processed: ${restaurants.length}`);
      console.log(`Total Menu Items Created: ${menuItems.length}`);
      console.log(`Average Items per Restaurant: ${(menuItems.length / restaurants.length).toFixed(1)}`);
   } catch (error) {
      console.error("Error during menu seeding:", error);
      throw error;
   } finally {
      await mongoose.disconnect();
      console.log("\nDatabase connection closed");
      console.timeEnd("Menu seeding time");
   }
}

seedMenus().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
