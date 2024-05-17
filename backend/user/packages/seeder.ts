import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import UserModel from "../model";
import Chance from "chance";
import logger from "../../../config/logger";
import PackageModel from "../../model/package.model";
import packageModel from "../../model/package.model";

const chance = new Chance();

// Helper function to get a random latitude and longitude within Abuja's approximate boundaries

// Helper function to generate a random address in Abuja

// Example usage

async function seedPackages() {
   console.time("Seeding time");
   try {
      await connectDB();
      await packageModel.deleteMany();

      const allUsers = await UserModel.find({});
      if (!allUsers.length) {
         logger.error("No users found");

         console.error("No users found");
         return;
      }

      for (const user of allUsers) {
         // Define the number of packages to create for each user
         const numPackages = 5;

         for (let i = 0; i < numPackages; i++) {
            const pickupDetails = {};

            const dropoffDetails = {};

            const newPackage = {
               userId: user.userId,
               email: user.email,
               pickupDetails,
               dropoffDetails,
               // Add other package details here...
            };

            await PackageModel.create(newPackage);
         }
      }

      console.log("All packages have been successfully created.");
   } catch (error) {
      console.error("Error seeding data:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed.");
      console.timeEnd("Seeding time");
   }
}

seedPackages().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});

console.log("Seeding packages...");
