import { connectDB } from "../../../config/mongodb";
import AuthModel from "../../model/auth.model";

async function makeAdmin(email: string) {
   await connectDB();

   // find user by email

   const user = await AuthModel.findOne({ email: email });

   if (!user) {
      console.log("User not found");
      process.exit(1);
   }

   await AuthModel.updateOne({ email: email }, { role: "admin" });

   console.log(`User with email ${email} has been elevated to an admin`);

   process.exit(1);
}

const emailArg = process.argv[2];

const undo = process.argv[3];

if (
   !emailArg ||
   process.argv.includes("-h") ||
   process.argv.includes("--help")
) {
   process.exit(1);
}

if (!emailArg) {
   console.log("Please provide an email");
   process.exit(1);
}

makeAdmin(emailArg).catch(console.error);
