import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";

import TestimonialModel from "../../model/testimonial.model";

// Separate module for DB connection

async function seedData() {
   try {
      await connectDB();

      await TestimonialModel.deleteMany();
      const dummyData: any[] = [
         {
            name: "Chika Okonkwo",
            company: "Anbe",
            description:
               "Working with Katalyst Technologies has been a game-changer for our business. Their custom software development services helped us streamline our operations and enhance our productivity. We highly recommend their expertise to any organization seeking innovative IT solutions.",
            image: "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034092/1043_ah7rtl.jpg",
         },
         {
            name: "Adewale Adekunle",
            company: "H2O Water Delivery",
            description:
               "We are immensely grateful for the exceptional IT infrastructure management services delivered by Katalyst Technologies. Their comprehensive approach ensured that our systems were secure, reliable, and optimized for performance. It has been a pleasure working with such a competent team.",
            image: "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034709/290_qnpjlo.jpg",
         },
         {
            name: "Ngozi Onuoha",
            company: "Online Banker Reporting System",
            description:
               "Katalyst Technologies played a pivotal role in our digital transformation journey. Their strategic consulting services provided invaluable insights, enabling us to modernize our operations and stay ahead of the curve. We commend their professionalism and commitment to excellence.",
            image: "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034185/1392_ldt8zi.jpg",
         },
         {
            name: "Emeka Nwachukwu",
            company: "TechGenius Solutions",
            description:
               "Katalyst Technologies exceeded our expectations with their e-commerce solutions. Their team has a unique attention to detail and dedication to delivering a seamless online shopping experience significantly boosted our sales and customer satisfaction. We highly endorse their services .",
            image: "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034699/doctor-consulting-patient-giving-recommendation-african-american-doctor-during-his-work-with-patients-explaining-recipes-drug-daily-hard-work-health-lives-saving-during-epidemic_fehwz7.jpg",
         },
         {
            name: "Aisha Mohammed",
            company: "HealthCare Innovations",
            description:
               "We are immensely impressed by the data analytics and business intelligence solutions provided by Katalyst Technologies. Their insights-driven approach empowered us to make data-driven decisions, leading to improved patient outcomes and operational efficiency. Kudos to their team for their expertise and professionalism.",
            image: "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034167/african-woman-working-psychology-clinic-waiving-saying-hello-happy-smiling-friendly-welcome-gesture_lwod4y.jpg",
         },
         {
            name: "Olufemi Okeke",
            company: "Global Logistics Network",
            description:
               "Katalyst Technologies played a crucial role in our digital transformation journey. Their strategic consulting services helped us navigate complex challenges and leverage emerging technologies to optimize our logistics operations. We are grateful for their partnership and highly recommend their services to others.",
            image: "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034792/business-man-relaxing-after-finishing-task-taking-break-startup-office-employee-feeling-carefree-sitting-with-hands-head-relax-daydream-after-job-is-done-peaceful-adult_1_v2ljxf.jpg",
         },
      ];

      // Combine USD and NGN data

      for (const item of dummyData) {
         const newData = new TestimonialModel({
            name: item.name,
            enabled: true,
            description: item.description,
            image: item.image,
            company: item.company,
            createdAt: new Date(),
            updatedAt: new Date(),
         });

         await newData.save();

         console.log(newData);
      }

      // const allServices = await ServicesModel.insertMany(dummyServices);

      // console.log(`${allServices.length} services seeded.`);
      console.log(`testimonial seeded.`);
   } catch (error) {
      console.error("Error seeding data:", error);
      return; // Early return on error
   } finally {
      await mongoose.disconnect();
   }
   console.log("Data successfully seeded ??");
}

seedData().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});

/*

{



  "testimonials": [
    {
      "name": "Chika Okonkwo",
      "company": "Anbe",
      "description": "Working with Katalyst Technologies has been a game-changer for our business. Their custom software development services helped us streamline our operations and enhance our productivity. We highly recommend their expertise to any organization seeking innovative IT solutions.",
      "image": "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034092/1043_ah7rtl.jpg"
    },
    {
      "name": "Adewale Adekunle",
      "company": "H2O Water Delivery",
      "description": "We are immensely grateful for the exceptional IT infrastructure management services delivered by Katalyst Technologies. Their comprehensive approach ensured that our systems were secure, reliable, and optimized for performance. It has been a pleasure working with such a competent team.",
      "image": "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034709/290_qnpjlo.jpg"
    },
    {
      "name": "Ngozi Onuoha",
      "company": "Online Banker Reporting System",
      "description": "Katalyst Technologies played a pivotal role in our digital transformation journey. Their strategic consulting services provided invaluable insights, enabling us to modernize our operations and stay ahead of the curve. We commend their professionalism and commitment to excellence.",
      "image": "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034185/1392_ldt8zi.jpg"
    },
    {
      "name": "Emeka Nwachukwu",
      "company": "TechGenius Solutions",
      "description": "Katalyst Technologies exceeded our expectations with their e-commerce solutions. Their team has a unique attention to detail and dedication to delivering a seamless online shopping experience significantly boosted our sales and customer satisfaction. We highly endorse their services .",
      "image": "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034699/doctor-consulting-patient-giving-recommendation-african-american-doctor-during-his-work-with-patients-explaining-recipes-drug-daily-hard-work-health-lives-saving-during-epidemic_fehwz7.jpg"
    },
    {
      "name": "Aisha Mohammed",
      "company": "HealthCare Innovations",
      "description": "We are immensely impressed by the data analytics and business intelligence solutions provided by Katalyst Technologies. Their insights-driven approach empowered us to make data-driven decisions, leading to improved patient outcomes and operational efficiency. Kudos to their team for their expertise and professionalism.",
      "image": "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034167/african-woman-working-psychology-clinic-waiving-saying-hello-happy-smiling-friendly-welcome-gesture_lwod4y.jpg"
    },
    {
      "name": "Olufemi Okeke",
      "company": "Global Logistics Network",
      "description": "Katalyst Technologies played a crucial role in our digital transformation journey. Their strategic consulting services helped us navigate complex challenges and leverage emerging technologies to optimize our logistics operations. We are grateful for their partnership and highly recommend their services to others.",
      "image": "https://res.cloudinary.com/dqwfjxn8g/image/upload/v1709034792/business-man-relaxing-after-finishing-task-taking-break-startup-office-employee-feeling-carefree-sitting-with-hands-head-relax-daydream-after-job-is-done-peaceful-adult_1_v2ljxf.jpg"
    }
  ]
}



* */
