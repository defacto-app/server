import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";
import ProjectsModel from "../../model/projects.model";

// Separate module for DB connection

async function seedProjects() {
   try {
      await connectDB();

      await ProjectsModel.deleteMany();
      const dummyData: any[] = [
         {
            id: "1",
            logo: "merilebon.webp",
            year: 2022,
            projectUrl: "#",
            title: "Merilebon Academy School Project",
            description:
               "Merilebon Academy entrusted us to design their website, built with WordPress and Elementor. Our focus was on showcasing their commitment to providing a nurturing and fulfilling educational experience. By meeting with each student and offering places selectively, Merilebon ensures a happy and successful learning environment. Prospective parents and pupils are encouraged to visit the academy to experience firsthand why Merilebon is the right choice.",
            tech: "WordPress, PHP, Elementor, Laravel",
         },
         {
            id: "2",
            logo: "martoni.webp",
            year: 2023,
            title: "Martoni Concepts",
            projectUrl: "#",
            description:
               "Online Banker stands as a pioneering reporting platform, giving users the leverage to report financial discrepancies and crimes. With each report, necessary actions are set in motion, reaching the relevant authorities. Alongside its vital functions, the platform excels in design aesthetics and user-friendliness.",
            tech: "WordPress, PHP, Elementor, Laravel",
         },
         {
            id: "3",
            logo: "Anbe.webp",
            year: 2022,
            title: "Anbe Nigeria",
            description:
               "An influential player in the construction, oil, and gas sector, Anbe Nigeria required a web presence that reflected its stature. Collaborating with giants like Shell, Chevron, and ExxonMobil, our design for Anbe, crafted with Vue.js, manifests sophistication and efficiency, integrated with features like project showcases, client testimonials, and real-time contract updates.",
            tech: "Vue.js, Tailwind",
         },
         {
            id: "4",
            logo: "sprynx.png",
            year: 2021,
            title: "Sprynx Multi",
            projectUrl: "#",
            description:
               "A cutting-edge web app tailored for Sprynx Multi, a renowned car wash and detailing company. We delivered a seamless booking system, complete with diverse washing packages. Designed using the progressive Nuxt.js framework, the platform boasts of intuitive user experience and efficient performance.",
            tech: "Nuxt, Node.js, Tailwind",
         },
         {
            id: "5",
            logo: "nass.png",
            year: 2021,
            title: "Nass Contracting",
            projectUrl: "#",
            description:
               "Nass Contracting Company Limited, an esteemed engineering and contracting firm, entrusted us with the development of their website. As your premier partner in building and general contracting services, Nass Contracting Company Limited required a digital platform that reflects their rich history of excellence and commitment to quality. Leveraging WordPress with Elementor, we meticulously crafted a bespoke website that embodies Nass Contracting's ethos of innovation and client satisfaction.",
            tech: "WordPress, Elementor",
         },
         {
            id: "6",
            logo: "buck-apex-logo.png",
            year: 2022,
            title: "BuckApex",
            description:
               "BuckApex revolutionizes the currency exchange process, offering users a platform to seamlessly swap currencies from anywhere. Beyond its core functionality, its design radiates modern aesthetics, ensuring users not only perform tasks but relish the experience.",
            tech: "React Native, Node.js",
            projectUrl: "#",
         },
         {
            id: "7",
            logo: "h2o.svg",
            year: 2023,
            title: "H2O Nigeria",
            description:
               "H2O Nigeria is the epitome of convenience, bringing hydration to your doorstep. Located in Abuja, this e-commerce platform, designed with Vue and Nuxt, ensures water delivery is just a few clicks away. Complete with payment integrations and real-time tracking, it sets a benchmark in e-commerce excellence.",
            tech: "Vue.js, Nuxt.js",
            projectUrl: "#",
         },
         {
            id: "8",
            logo: "wildstream.webp",
            year: 2023,
            title: "Wildstream",
            description:
               "Wildstream is the voice of emerging artists. This music streaming platform empowers artists to share their craft with the world, free of charge. Crafted with Vue, the platform provides listeners an unparalleled experience, with curated playlists, real-time recommendations, and seamless streaming.",
            tech: "Vue.js, Node.js",
            projectUrl: "#",
         },
         {
            id: "9",
            logo: "bdcam.png",
            year: 2023,
            title: "Behind DCAM",
            description:
               "DCAM Wedding Films, a leading media company in Abuja, partnered with us to develop their website. We used WordPress with Elementor to create a platform showcasing their unique blend of documentary-style and contemporary fashion-inspired wedding films. With meticulous attention to detail, we captured the essence of each couple's special day, delivering unforgettable cinematic experiences. We're proud to have collaborated with DCAM Wedding Films on this project, enhancing their online presence and storytelling capabilities.",
            tech: "WordPress, Elementor",
            projectUrl: "#",
         },
      ];

      for (const item of dummyData) {
         const techArray = item.tech.split(",");

         const newData = new ProjectsModel({
            title: item.title,
            description: item.description,
            category: techArray,
            enabled: true,
            logo: `uploads/logos/${item.logo}`,
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
