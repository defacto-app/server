import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import UserModel from "../model";
import Chance from "chance";
import logger from "../../../config/logger";
import PackageModel from "../../model/package.model";
import packageModel from "../../model/package.model";

const chance = new Chance();

// Helper function to get a random latitude and longitude within Abuja's approximate boundaries
function getRandomCoordinatesForAbuja() {
   const latRange = { min: 8.9, max: 9.2 };
   const lngRange = { min: 7.3, max: 7.6 };

   return {
      lat: chance.floating({ min: latRange.min, max: latRange.max }),
      lng: chance.floating({ min: lngRange.min, max: lngRange.max }),
   };
}

// Helper function to generate a random address in Abuja
function getRandomAbujaAddress() {
   const addresses = [
      "2 Rwang Pam St, Gwarinpa, Federal Capital Territory, Nigeria",
      "Bala Sokoto Wy, Jabi, Abuja 900108, Federal Capital Territory, Nigeria",
      "No 5, Kandi Close, Off Aminu Kano Crescent, Wuse 2, Abuja",
      "23 Lobito Crescent, Wuse 2, Abuja",
      "Plot 224 Solomon Lar Way, Utako District, Abuja",
   ];

   const locations = ["Gwarinpa", "Jabi", "Wuse 2", "Utako", "Maitama"];

   return {
      address: chance.pickone(addresses),
      location: chance.pickone(locations),
   };
}

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
         const { address, location } = getRandomAbujaAddress();
         const { lat, lng } = getRandomCoordinatesForAbuja();

         const pickupDetails = {
            phone: chance.phone({ country: "ng" }), // Generates a phone number in Nigerian format
            address,
            location,
            coordinates: {
               lat,
               lng,
            },
         };

         const dropoffDetails = {
            phone: chance.phone({ country: "ng" }), // Generates a phone number in Nigerian format
            address,
            location,
            coordinates: {
               lat,
               lng,
            },
         };

         const newPackage = {
            userId: user.userId,
            email: user.email,
            pickupDetails,
            dropoffDetails,
            // Add other package details here...
         };

         await PackageModel.create(newPackage);
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
