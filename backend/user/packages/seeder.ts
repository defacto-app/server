import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import UserModel from "../model";
import PackageModel from "../../model/package.model";
import Chance from "chance";
import logger from "../../../config/logger";
import AddressModel from "../../address/model";

const chance = new Chance();
const packageItems = [
   "books",
   "food",
   "shoes",
   "clothes",
   "electronics",
   "toys",
   "furniture",
   "appliances",
   "tools",
   "cosmetics",
];

async function seedPackages() {
   console.time("Seeding time");
   try {
      await connectDB();
      await PackageModel.deleteMany();

      const allUsers = await UserModel.find({});
      if (!allUsers.length) {
         logger.error("No users found");
         console.error("No users found");
         return;
      }

      for (const user of allUsers) {
         const userAddresses = await AddressModel.find({ userId: user.userId });
         if (!userAddresses.length) {
            logger.error(`No addresses found for user ${user.userId}`);
            console.error(`No addresses found for user ${user.userId}`);
            continue;
         }

         const numPackages = 4;
         for (let i = 0; i < numPackages; i++) {
            const pickupAddress = chance.pickone(userAddresses);
            const dropOffAddress = chance.pickone(userAddresses);

            const packageDetails = {
               dropOffDetails: {
                  address: dropOffAddress,
               },
               pickupDetails: {
                  address: pickupAddress,
               },
               charge: chance.integer({ min: 1000, max: 5000 }),
               status: chance.pickone(["pending", "completed", "cancelled"]),
               pickupTime: chance.date({ year: 2024 }),
               assignedTo: chance.name(),
               isInstant: chance.bool(),
               deliveryId: chance.guid(),
               description: chance.sentence({ words: 5 }),
               cashPaymentLocation: chance.pickone(["Pick-up", "Delivery"]),
               cashAvailable: {
                  available: chance.bool(),
                  amount: chance.integer({ min: 100, max: 1000 }),
               },
               packageContent: chance.pickset(packageItems, 5),
            };

            const newPackage = {
               userId: user.userId,
               email: user.email,
               ...packageDetails,
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
