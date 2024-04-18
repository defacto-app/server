import express from "express";
import env from "./config/env";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import listEndpoints from "express-list-endpoints";
import path from "path";
import fs from "fs";


import DashboardRoutes from "./backend/routes/admin/dashboard.routes";

import AuthRoutes from "./backend/routes/auth.routes";
// all routes
// configs
import { connectDB } from "./config/mongodb";

import { emailEvents } from "./config/eventEmitter";
import { HandlePayload } from "./config/utils/api-routes";
import swaggerUi from "swagger-ui-express";
import { $file } from "./config/config";


const swaggerDocument = $file.json + "/swagger.json" as any




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
   res.sendFile(path.join(__dirname, "public/index.html"));
});

// Check if the file exists
if (!fs.existsSync(swaggerDocument)) {
   console.error("Swagger document does not exist");
} else {
   console.log("Swagger document exists");
}

emailEvents();


console.log(swaggerDocument);



// app.use("/api", PublicRoutes);
app.use("/api/admin/auth", AuthRoutes);

app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// router.use('/api/api-docs', swaggerUi.serve);
// router.get('/api/api-docs', swaggerUi.setup(swaggerDocument));


app.use("/api/admin/dashboard", DashboardRoutes);

app.use("/uploads", express.static(path.join(__dirname, "storage/uploads")));

const listApis = listEndpoints(app);

console.table(listApis);

const handlePayload: HandlePayload = new HandlePayload(listApis);

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
