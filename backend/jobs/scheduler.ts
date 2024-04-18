import cron from "node-cron";

export const startCronJobs = () => {
   cron.schedule("* * * * *", () => {
      console.log("This  the first job * * * * *");
   });

   cron.schedule("* * * * *", () => {
      console.log("The second job * * * * *");
   });

   // You can add more scheduled tasks here if needed
};
