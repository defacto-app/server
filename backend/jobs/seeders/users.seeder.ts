import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import UserAuthModel from "../../model/userAuth.model";
import moment from "moment";
import { nanoid } from "nanoid";

import Chance from "chance";
import { generateOTP } from "../../utils/utils";

const chance = new Chance();

// Separate module for DB connection

async function seedTeams() {
   try {
      await connectDB();

      await UserAuthModel.deleteMany();
      const specialUsers = [
         {
            email: `jaynette101@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt:new Date(),

            role: "admin",
         },
     {
            email: `justice.nmegbu@gmail.com`,
        joinedAt: new Date("2024-04-29"),
        lastSeenAt:new Date(),

        role: "admin",
         },

         {
            email: `isaiahogbodo06@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt:new Date(),

            role: "user",
         },
         {
            email: `brianfury733@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt:new Date(),
            role: "admin",
         },
         {
            email: `kats.com.ng@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt:new Date(),
            role: "admin",
         },
      ];

      const numberOfUsers = 10 + specialUsers.length; // Number of users to generate

      for (let i = 0; i < numberOfUsers; i++) {
         // Randomly select an email from the specialUsers array


         const user = new UserAuthModel({
            email:
               i < specialUsers.length ? specialUsers[i].email : chance.email(),

            // role can be admin or user

            role: i < specialUsers.length ? specialUsers[i].role : "user",

            phoneNumber:
               "+23480" + chance.string({ length: 7, pool: "0123456789" }),
            password: await UserAuthModel.hashPassword("123456"),
            email_management: {
               verified: i === 0,
               otp: "421557",
               otp_expires_at: moment().add(1, "day").toDate(),
            },
            phone_management: {
               verified: i === 0,
               otp: "421557",
               otp_sent_at: moment().toDate(),
               otp_expires_at: moment().add(1, "day").toDate(),
            },
            joinedAt: i < specialUsers.length ? specialUsers[i].joinedAt : new Date(),
         });

         console.log("User:", user);

         await user.save();
      }

      console.log("Users successfully seeded.");
   } catch (error) {
      console.error("Error seeding data:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed.");
   }
}

seedTeams().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
