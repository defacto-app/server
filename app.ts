import express from "express";
import env from "./config/env";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import listEndpoints from "express-list-endpoints";


import DashboardRoutes from "./backend/routes/admin/dashboard.routes";

import path from "path";
// packages
// all routes
import AuthRoutes from "./backend/routes/auth.routes";
// all routes
// configs
import { connectDB } from "./config/mongodb";

import { emailEvents } from "./config/eventEmitter";

const app = express();

app.use(cors());

app.use(morgan("tiny"));

app.use(express.json());

app.use(
   session({
      secret: "your_secret_key", // Replace with a real secret key
      resave: false,
      saveUninitialized: false,
   })
);


app.get("/", (req, res) => {
   res.send("<h1>Katalyst Technologies server</h1>");
});

emailEvents();

app.use("/api/admin/auth", AuthRoutes);

// dashboard routes

app.use("/api/admin/dashboard", DashboardRoutes);

app.use("/uploads", express.static(path.join(__dirname, "storage/uploads")));

console.table(listEndpoints(app));

(async () => {
   try {
      await connectDB().then(() => {
         app.listen(env.APP_PORT, () => {
            console.log(`listening at http://localhost:${env.APP_PORT}`);
         });
      });
   } catch (error) {
      console.error("Startup error:", error);
      process.exit(1);
   }
})();
