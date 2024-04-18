import mongoose from "mongoose";
import { connectDB } from "../../../config/mongodb";

import TeamsModel from "../../model/teams.model";

// Separate module for DB connection

async function seedTeams() {
   try {
      await connectDB();

      await TeamsModel.deleteMany();
      const dummyTeams: any[] = [
         {
            id: "1",
            fullName: "Brian Azukaeme",
            position: "Senior Front-end Engineer",
            slug: "brian-azukaeme",
            image: "/team/team.jpg",
            summary:
               "Experienced Front-end Engineer with a passion for creating responsive and user-friendly web applications. Skilled in HTML, CSS, JavaScript, and React.",
            experience: [
               {
                  title: "Lead Front-end Developer",
                  company: "Katalyst Solutions Inc.",
                  location: "New York, NY",
                  date: "Jan 2018 - Present",
                  description:
                     "Managed a team of 5 developers and led the front-end development of multiple projects. Collaborated with designers and backend developers to deliver high-quality web applications.",
               },
               {
                  title: "Front-end Developer",
                  company: "Web Design Co.",
                  location: "San Francisco, CA",
                  date: "Aug 2015 - Dec 2017",
                  description:
                     "Developed responsive and cross-browser compatible websites using HTML, CSS, and JavaScript. Implemented UI/UX designs provided by the design team.",
               },
            ],
            education: [
               {
                  degree: "Bachelor of Science in Computer Science",
                  school: "University of California, Berkeley",
                  location: "Berkeley, CA",
                  date: "2011 - 2015",
               },
            ],
            skills: [
               "HTML",
               "CSS",
               "JavaScript",
               "React",
               "Responsive Design",
               "UI/UX Design",
            ],
         },
         {
            id: "2",
            fullName: "Sam Nmeje",
            position: " Front-end Engineer",
            slug: "samuel-nmeje",
            image: "/team/team.jpg",
            summary:
               "Experienced Front-end Engineer with a passion for creating responsive and user-friendly web applications. Skilled in HTML, CSS, JavaScript, and React.",
            experience: [
               {
                  title: "Lead Front-end Developer",
                  company: "Tech Solutions Inc.",
                  location: "New York, NY",
                  date: "Jan 2018 - Present",
                  description:
                     "Managed a team of 5 developers and led the front-end development of multiple projects. Collaborated with designers and backend developers to deliver high-quality web applications.",
               },
               {
                  title: "Front-end Developer",
                  company: "Web Design Co.",
                  location: "San Francisco, CA",
                  date: "Aug 2015 - Dec 2017",
                  description:
                     "Developed responsive and cross-browser compatible websites using HTML, CSS, and JavaScript. Implemented UI/UX designs provided by the design team.",
               },
            ],
            education: [
               {
                  degree: "Bachelor of Science in Computer Science",
                  school: "University of California, Berkeley",
                  location: "Berkeley, CA",
                  date: "2011 - 2015",
               },
            ],
            skills: [
               "HTML",
               "CSS",
               "JavaScript",
               "React",
               "Responsive Design",
               "UI/UX Design",
            ],
         },
         {
            id: "3",
            fullName: "Obee",
            position: "Mobile Developer",
            slug: "obee-won",
            image: "/team/team.jpg",
            summary:
               "Experienced Front-end Engineer with a passion for creating responsive and user-friendly web applications. Skilled in HTML, CSS, JavaScript, and React.",
         },
      ];

      // Combine USD and NGN data

      for (const item of dummyTeams) {
         // get only the last name

         const newTeam = new TeamsModel({
            fullName: item.fullName,
            enabled: true,
            summary: item.summary,
            position: item.position,
            image: item.image,
            createdAt: new Date(),
            updatedAt: new Date(),
            skills: item.skills,
         });

         await newTeam.save();

         console.log(newTeam);
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

seedTeams().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
