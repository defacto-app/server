import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import ProjectsModel from "../../model/projects.model";
import CategoryModel from "../../model/category.model";

// Separate module for DB connection

async function seedProjects() {
   try {
      await connectDB();

      await CategoryModel.deleteMany();
      const dummyData: any[] = [
         {
            title: "Custom Software Development",
            slug: "custom-software-development",
         },
      ];

      for (const item of dummyData) {
         const techArray = item.tech.split(",");

         const newData = new ProjectsModel({
            title: item.title,
            description: item.description,
            category: techArray,
            enabled: true,
            logo: item.logo,
            year: item.year,
            projectUrl: item.projectUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [
               "software",
               "development",
               "cloud",
               "services",
               "solutions",
               "data",
               "analytics",
               "business",
               "intelligence",
               "infrastructure",
               "management",
               "e-commerce",
            ],
         });
         await newData.save();
         console.log(newData);
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

seedProjects().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
