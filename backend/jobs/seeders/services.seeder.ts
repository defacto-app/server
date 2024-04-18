import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import ServicesModel from "../../model/services.model";

// Separate module for DB connection

async function seedServices() {
   try {
      await connectDB();

      await ServicesModel.deleteMany();
      const dummyServices: any[] = [
         {
            name: "Custom Software Development",
            description:
               "Designing and developing custom software solutions to address specific business needs, improve efficiency, and drive growth.",
            href: "#",
            icon: "LockClosedIcon",
         },
         {
            name: "Mobile App Development",
            description:
               "Creating high-quality, user-friendly mobile applications for iOS and Android platforms, tailored to meet the unique requirements of businesses and end-users.",
            href: "#",
            icon: "ArrowPathIcon",
         },
         {
            name: "Web Development",
            description:
               "Building responsive, cross-platform web applications and websites using modern technologies and frameworks to deliver seamless user experiences.",
            href: "#",
            icon: "CloudArrowUpIcon",
         },
         {
            name: "Enterprise Software Solutions",
            description:
               "Developing scalable, secure, and feature-rich enterprise software solutions to streamline operations, enhance productivity, and drive business growth.",
            href: "#",
            icon: "LockClosedIcon",
         },
         {
            name: "Quality Assurance and Testing",
            description:
               "Comprehensive testing and quality assurance services to ensure the reliability, performance, and security of software applications and systems.",
            href: "#",
            icon: "ArrowPathIcon",
         },

         {
            name: "Cloud Services and Solutions",
            description:
               "Assistance with migrating to the cloud, cloud infrastructure management, and implementing cloud-based applications for enhanced scalability, flexibility, and cost-effectiveness.",
            href: "#",
            icon: "LockClosedIcon",
         },
         {
            name: "Data Analytics and Business Intelligence",
            description:
               "Utilizing advanced analytics tools and techniques to extract insights from data, driving informed decision-making and optimizing business processes.",
            href: "#",
            icon: "ArrowPathIcon",
         },
         {
            name: "IT Infrastructure Management",
            description:
               "Comprehensive management and maintenance of IT infrastructure, including network setup, cybersecurity solutions, server management, and IT support services.",
            href: "#",
            icon: "CloudArrowUpIcon",
         },
         {
            name: "E-commerce Solutions",
            description:
               "Design, development, and optimization of e-commerce platforms to facilitate online sales, improve customer experiences, and drive revenue growth for businesses operating in the digital marketplace.",
            href: "#",
            icon: "LockClosedIcon",
         },
         {
            name: "Digital Transformation Consulting",
            description:
               "Strategic guidance and support for organizations looking to modernize their operations, embrace emerging technologies, and adapt to evolving market trends.",
            href: "#",
            icon: "ArrowPathIcon",
         },
      ];

      // Combine USD and NGN data

      for (const service of dummyServices) {
         const newService = new ServicesModel({
            title: service.name,
            description: service.description,
            enabled: true,
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

         await newService.save();

         console.log(newService);
      }

      // const allServices = await ServicesModel.insertMany(dummyServices);

      // console.log(`${allServices.length} services seeded.`);
      console.log(`services seeded.`);
   } catch (error) {
      console.error("Error seeding data:", error);
      return; // Early return on error
   } finally {
      await mongoose.disconnect();
   }
   console.log("Data successfully seeded ??");
}

seedServices().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
