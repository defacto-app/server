import mongoose from "mongoose";
import env from "./env";

const uri = `${env.MONGODB_SERVER}/${env.MONGODB_DATABASE}`;

if (env.isDev) {
   // mongoose.set("debug", true);
}

export async function connectDB(): Promise<void> {
   try {
      await mongoose.connect(uri);
      console.log("Database Connection Initialized.");
   } catch (error) {
      console.error("Could not connect to MongoDB", error);
      process.exit(1);
   }
}
