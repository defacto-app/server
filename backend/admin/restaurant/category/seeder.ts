import CategoryModel from "./model";
import { connectDB } from "../../../../config/mongodb";
import mongoose from "mongoose";

const categories = [
   "Bakery and Pastry",
   "Breakfast",
   "Burgers",
   "Chinese",
   "Desserts",
   "rice",
   "Grill",
   "Healthy",
   "international",
   "juices",
   "Local food",
   "Nigerian",
   "Pizza",
   "Seafood",
   "Shawarma",
   "Snacks",
   "Traditional",
];

async function seedCategories() {
   console.time("Seeding time");
   try {
      // Connect to the database
      await connectDB();

      // Clear out existing categories if necessary
      await CategoryModel.deleteMany();

      // Prepare the categories for insertion
      const categoryData = categories.map((categoryName) => ({
         name: categoryName,
         slug: categoryName.toLowerCase().replace(/\s+/g, "-"), // Create a slug from the name
         description: `Category for ${categoryName}`, // Optional description for each category
         active: true, // Set active to true for all
         createdAt: new Date(),
         updatedAt: new Date(),
         categoryType: "food",
      }));

      // Insert the new categories
      await CategoryModel.insertMany(categoryData);

      console.log("Categories seeded successfully.");
   } catch (error) {
      console.error("Error seeding data:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed.");
      console.timeEnd("Seeding time");
   }
}

seedCategories().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});

console.log("Seeding categories...");
