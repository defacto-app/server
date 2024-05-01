import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import AuthModel from "../../model/auth.model";
import moment from "moment";

import Chance from "chance";
import UserModel from "../../model/user.model";

const chance = new Chance();

// Separate module for DB connection

async function seedTeams() {
   console.time("Seeding time");
   try {
      await connectDB();

      await AuthModel.deleteMany();
      await UserModel.deleteMany();
      const specialUsers = [
         {
            email: `jaynette101@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt: new Date(),

            role: "admin",
         },
         {
            email: `justice.nmegbu@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt: new Date(),

            role: "admin",
         },

         {
            email: `isaiahogbodo06@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt: new Date(),

            role: "user",
         },
         {
            email: `brianfury733@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt: new Date(),
            role: "admin",
         },
         {
            email: `kats.com.ng@gmail.com`,
            joinedAt: new Date("2024-04-29"),
            lastSeenAt: new Date(),
            role: "admin",
         },
      ];

      const numberOfUsers = 10 + specialUsers.length; // Number of users to generate

      for (let i = 0; i < numberOfUsers; i++) {
         const auth = new AuthModel({
            email:
               i < specialUsers.length ? specialUsers[i].email : chance.email(),

            // role can be admin or user

            role: i < specialUsers.length ? specialUsers[i].role : "user",

            phoneNumber:
               "+23480" + chance.string({ length: 7, pool: "0123456789" }),
            password: await AuthModel.hashPassword("123456"),
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
            joinedAt:
               i < specialUsers.length ? specialUsers[i].joinedAt : new Date(),
         });

         // Save the user to the database

         const user = new UserModel({
            email: auth.email,
            joinedAt: auth.joinedAt,
            firstName: chance.first(),
            phoneNumber: auth.phoneNumber,
            userId: auth.publicId,
         });

         await user.save();

         await auth.save();
      }
   } catch (error) {
      console.error("Error seeding data:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed.");
      console.timeEnd("Seeding time");
   }
}

seedTeams().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
