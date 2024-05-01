import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import AuthModel from "../../model/auth.model";
import moment from "moment";

import Chance from "chance";
import UserModel from "../../model/user.model";

const chance = new Chance();

// Separate module for DB connection
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

async function seedTeams() {
   console.time("Seeding time");
   try {
      await connectDB();

      await AuthModel.deleteMany();
      await UserModel.deleteMany();

      const numberOfUsers = 10 + specialUsers.length; // Number of users to generate



      const {auths, authError} = await generateAuth();

      const {users,  usersError} = await generateUsers(auths);

      if (authError) {
         throw new Error(authError);
      }

      if (usersError) {
         throw new Error(usersError);
      }

      await AuthModel.insertMany(auths);

      await UserModel.insertMany(users);

      console.log(users);
   } catch (error) {
      console.error("Error seeding data:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed.");
      console.timeEnd("Seeding time");

      // log duration


   }
}

seedTeams().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});

async function generateAuth() {
   const auths = [];

   try {
      const defaultPassword = await AuthModel.hashPassword("123456");
      // use specialUsers to generate auths
      for (let i = 0; i < specialUsers.length; i++) {
         const auth = new AuthModel({
            email: specialUsers[i].email,
            role: specialUsers[i].role,
            phoneNumber:
               "+23480" + chance.string({ length: 7, pool: "0123456789" }),
            password: defaultPassword,
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
            joinedAt: specialUsers[i].joinedAt,
         });

         auths.push(auth);
      }

      // use auths to generate users

      return {
         auths,
         authError: null,
      };
   } catch (e: any) {
      return {
         auths: null,
         authError: e.message,
      };
   }
}

async function generateUsers(auth:any) {

   const users = [];

   try {
      for (let i = 0; i < auth.length; i++) {
         const user = new UserModel({
            email: auth[i].email,
            phoneNumber: auth[i].phoneNumber,
            joinedAt: auth[i].joinedAt,
            lastSeenAt: auth[i].lastSeenAt,
            userId: auth[i].publicId,
         });

         users.push(user);
      }

      return {
         users,
         usersError: null,
      };
   } catch (e: any) {
      return {
         users: null,
         usersError: e.message,
      };
   }



}
