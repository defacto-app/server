import { connectDB } from "../../../config/mongodb";
import FileModel from "../../model/files.model";

async function unDeleteFile() {
   await connectDB();

   // find user by email

   // update many files

   const files = await FileModel.find({
      deleted: true,
   });

   if (!files) {
      process.exit(1);
   }

   // update  all the deleted field to false

   for (let i = 0; i < files.length; i++) {
      const file = files[i];

      file.deleted = false;

      await file.save();
   }

   console.log(files, "all files");

   process.exit(1);
}

unDeleteFile();
