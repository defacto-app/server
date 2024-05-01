import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import AuthModel from "../../model/auth.model";
import { supabase } from "../../../config/supabase.config";

async function run() {
   try {
      await connectDB();

      await AuthModel.deleteMany();

      const { data , error } = await supabase.auth.admin.listUsers()

      if (error) {
         console.error("Error fetching users", error);
         return;
      }
      console.log(data.users, "jjj")

      const users = data.users || [];

      for (const user of users) {
         const newUser = new AuthModel(user);
         await newUser.save();
      }

      console.log(`projects seeded.`);
   } catch (error) {
      console.error("Error seeding data:", error);
      return; // Early return on error
   } finally {
      await mongoose.disconnect();
   }
   console.log("Data successfully seeded ??");
}

run().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});