import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import MenuModel from "../menu/model";
import CategoryModel from "../admin/restaurant/category/model";

async function migrateMenuCategories() {
   console.time("Migration time");
   try {
      // Connect to the database
      await connectDB();
      console.log("Connected to database");

      // 1. Get all unique categories using raw query to access old field
      const uniqueCategories = await mongoose.connection.collection('menus')
         .distinct('category');
      console.log(`Found ${uniqueCategories.length} unique categories`);

      // 2. Create Category documents for each unique category
      const categoryMap = new Map();

      for (const categoryName of uniqueCategories) {
         const existingCategory = await CategoryModel.findOne({
            name: categoryName,
            categoryType: 'menu'
         });

         if (existingCategory) {
            categoryMap.set(categoryName, existingCategory._id);
            console.log(`Category already exists: ${categoryName}`);
         } else {
            const newCategory = await CategoryModel.create({
               name: categoryName,
               categoryType: 'menu',
               active: true,
               description: `Menu items in the ${categoryName} category`
            });
            categoryMap.set(categoryName, newCategory._id);
            console.log(`Created new category: ${categoryName}`);
         }
      }

      // 3. Get all menu items using raw collection to access old fields
      const menuItems = await mongoose.connection.collection('menus').find({}).toArray();
      console.log(`Found ${menuItems.length} menu items to update`);

      let updatedCount = 0;
      let errorCount = 0;

      for (const menuItem of menuItems) {
         try {
            const categoryId = categoryMap.get(menuItem.category);
            if (!categoryId) {
               console.error(`No category ID found for menu item: ${menuItem.name} (category: ${menuItem.category})`);
               errorCount++;
               continue;
            }

            await MenuModel.updateOne(
               { _id: menuItem._id },
               {
                  $set: { categoryId: categoryId },
                  $unset: { category: "", menuType: "" }
               }
            );
            updatedCount++;

            // Log progress every 100 items
            if (updatedCount % 100 === 0) {
               console.log(`Progress: ${updatedCount}/${menuItems.length} items updated`);
            }
         } catch (error) {
            console.error(`Error updating menu item ${menuItem.name}:`, error);
            errorCount++;
         }
      }

      console.log("\nMigration Summary:");
      console.log(`- Total menu items processed: ${menuItems.length}`);
      console.log(`- Successfully updated: ${updatedCount}`);
      console.log(`- Errors encountered: ${errorCount}`);
      console.log(`- Categories created/mapped: ${categoryMap.size}`);

   } catch (error) {
      console.error("Migration failed:", error);
      throw error;
   } finally {
      await mongoose.disconnect();
      console.log("\nDatabase connection closed");
      console.timeEnd("Migration time");
   }
}

// Run the migration
migrateMenuCategories().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});

console.log("Starting menu category migration...");