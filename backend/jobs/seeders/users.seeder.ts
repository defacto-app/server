import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import UserModel from "../../model/user.model";
import moment from "moment";
import { nanoid } from "nanoid";

import Chance from "chance";
import { generateOTP } from "../../utils/utils";

const chance = new Chance();

// Separate module for DB connection

async function seedTeams() {
   try {
      await connectDB();

      const numberOfUsers = 2 ; // Number of users to generate
      const specialUsers = [
         {
            email: "admin1@gmail.com",
         },
         {
            email: "admin222@gmail.com",
         }
      ];


      for (let i = 0; i < numberOfUsers; i++) {
         const user = new UserModel({
            email: chance.email(),
            // role can be admin or user

            role: i === 0 ? "admin" : "user",

            phoneNumber: "+23480" + chance.string({ length: 7, pool: '0123456789' }),
            password: "123456",
            email_management:{
               verified: i === 0,
               otp: generateOTP(),
               otp_expires_at: moment().add(1, "day").toDate(),
            },
            phone_management:{
               verified: i === 0,
               otp: "794272",
               otp_sent_at: moment().toDate(),
               otp_expires_at: moment().add(1, "day").toDate(),
            }


         });

         console.log("User:", user);

         // await user.save();
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
