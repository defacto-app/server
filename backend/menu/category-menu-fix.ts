import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import CategoryModel from "../admin/restaurant/category/model";
import MenuModel from "./model";


function isObjectId(str: string) {
   return mongoose.Types.ObjectId.isValid(str) && /^[0-9a-fA-F]{24}$/.test(str);
}
async function migrateMenuCategories() {
   try {
      await connectDB();
      console.log("Connected to database");

      let processed = 0;
      let updated = 0;
      let failed = 0;
      const batchSize = 50;

      const totalMenus = await MenuModel.countDocuments();
      console.log(`Total menus to process: ${totalMenus}`);

      for (let skip = 0; skip < totalMenus; skip += batchSize) {
         const menus = await MenuModel.find()
            .skip(skip)
            .limit(batchSize)
            .lean();

         for (const menu of menus) {
            try {
               const currentCategoryId = menu.categoryId?.toString();

               // Check if it's an ObjectId
               if (!isObjectId(currentCategoryId)) {
                  console.log(`Menu "${menu.name}" categoryId is not an ObjectId: ${currentCategoryId}`);
                  processed++;
                  continue;
               }

               // Find the category using ObjectId
               const category = await CategoryModel.findById(currentCategoryId)
                  .select('publicId name')
                  .lean();

               if (!category) {
                  console.log(`No category found for menu: ${menu.name} (categoryId: ${currentCategoryId})`);
                  failed++;
                  processed++;
                  continue;
               }

               // Update the menu with the category's publicId
               await MenuModel.updateOne(
                  { _id: menu._id },
                  { $set: { categoryId: category.publicId } }
               );

               console.log(`Updated menu "${menu.name}" from ObjectId(${currentCategoryId}) to publicId(${category.publicId})`);
               updated++;

            } catch (error) {
               console.error(`Error updating menu ${menu.name}:`, error);
               failed++;
            }
            processed++;

            if (processed % 10 === 0) {
               console.log(`Progress: ${processed}/${totalMenus} (${Math.round(processed/totalMenus*100)}%)`);
            }
         }
      }

      console.log("\n=== Migration Summary ===");
      console.log({
         totalMenus,
         processed,
         updated,
         failed,
         successRate: `${Math.round((updated/totalMenus) * 100)}%`
      });

      // Verification step
      console.log("\nSample of records after migration:");
      const verificationSample = await MenuModel.find()
         .limit(5)
         .lean();

      // biome-ignore lint/complexity/noForEach: <explanation>
      verificationSample.forEach(menu => {
         console.log(`- ${menu.name}: categoryId = ${menu.categoryId}`);
      });

   } catch (error) {
      console.error("Migration failed:", error);
   } finally {
      await mongoose.disconnect();
      console.log("\nDatabase connection closed");
   }
}

/*
migrateMenuCategories().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
*/





async function getAllMenus() {
   try {
      await connectDB();
      console.log("Connected to database");

      const menus = await MenuModel.find().lean();
      console.log(`Found ${menus.length} menus`);
      console.log(menus);

   } catch (error) {
      console.error("Error fetching menus:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed");
   }
}

/*
getAllMenus().catch(error => {
   console.error("Unhandled error:", error);
   process.exit(1);
});*/



async function analyzeCategoryIds() {
   try {
      await connectDB();
      console.log("Connected to database");

      const menus = await MenuModel.find().lean();

      let objectIdCount = 0;
      let publicIdCount = 0;
      let nullCount = 0;

      // biome-ignore lint/complexity/noForEach: <explanation>
      menus.forEach(menu => {
         if (!menu.categoryId) {
            nullCount++;
         } else if (isObjectId(menu.categoryId.toString())) {
            objectIdCount++;
            console.log(`ObjectId format: ${menu.name} - ${menu.categoryId}`);
         } else {
            publicIdCount++;
            console.log(`PublicId format: ${menu.name} - ${menu.categoryId}`);
         }
      });

      console.log("\n=== Analysis Summary ===");
      console.log(`Total menus: ${menus.length}`);
      console.log(`ObjectId format: ${objectIdCount}`);
      console.log(`PublicId format: ${publicIdCount}`);
      console.log(`Null/undefined categoryId: ${nullCount}`);

   } catch (error) {
      console.error("Error analyzing menus:", error);
   } finally {
      await mongoose.disconnect();
      console.log("\nDatabase connection closed");
   }
}

analyzeCategoryIds().catch(error => {
   console.error("Unhandled error:", error);
   process.exit(1);
});











async function migrateMenuCategoryIds() {
   let connection;
   try {
      connection = await connectDB();
      console.log("Connected to database");

      if (mongoose.connection.readyState !== 1) {
         throw new Error("Database connection is not active");
      }

      // Get all menus and filter for ObjectId categoryIds
      const menus = await MenuModel.find().lean();
      const menusToUpdate = menus.filter(menu => isObjectId(menu.categoryId?.toString()));

      console.log(`Found ${menusToUpdate.length} menus to update`);

      let processed = 0;
      let updated = 0;
      let failed = 0;

      for (const menu of menusToUpdate) {
         try {
            const categoryId = menu.categoryId?.toString();

            // Find the category using ObjectId
            const category = await CategoryModel.findById(categoryId)
               .select('publicId name')
               .lean();

            if (!category) {
               console.log(`No category found for menu: ${menu.name} (categoryId: ${categoryId})`);
               failed++;
               continue;
            }

            // Update menu with category's publicId
            await MenuModel.updateOne(
               { _id: menu._id },
               { $set: { categoryId: category.publicId } }
            );

            console.log(`Updated menu "${menu.name}": ${categoryId} -> ${category.publicId}`);
            updated++;
         } catch (error) {
            console.error(`Error processing menu ${menu.name}:`, error);
            failed++;
         }

         processed++;
         if (processed % 10 === 0) {
            console.log(`Progress: ${processed}/${menusToUpdate.length}`);
         }
      }

      console.log("\n=== Migration Summary ===");
      console.log({
         menusToUpdate: menusToUpdate.length,
         processed,
         successfulUpdates: updated,
         failed,
      });
   } catch (error) {
      console.error("Migration failed:", error);
   } finally {
      if (connection && connection.readyState === 1) {
         await mongoose.disconnect();
         console.log("\nDatabase connection closed");
      }
   }
}

(async () => {
   try {
      await migrateMenuCategoryIds();
   } catch (error) {
      console.error("Unhandled error:", error);
      process.exit(1);
   }
})();