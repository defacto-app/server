import express from "express";
import env from "./config/env";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import listEndpoints from "express-list-endpoints";
import path from "path";

import DashboardRoutes from "./backend/routes/admin/dashboard.routes";

import AuthRoutes from "./backend/routes/auth.routes";
import UserRoutes from "./backend/routes/user/user.routes";
// configs
// configs
import { connectDB } from "./config/mongodb";

import { emailEvents } from "./config/eventEmitter";
import { HandlePayload } from "./config/utils/api-routes";
import swaggerUi from "swagger-ui-express";


import swaggerDocument from "./storage/json/swagger.json";
import fs from "fs";

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

const options = {
   swaggerOptions: {
      validatorUrl: null,
   },
};

app.use(
   "/api/api-docs",
   swaggerUi.serve,
   swaggerUi.setup(swaggerDocument, options)
);



app.get("/", (req, res) => {
   // Read the HTML file
   let html = fs.readFileSync(path.join(__dirname, "public/index.html"), 'utf8');

   // Replace ${BASE_URL} with the actual base URL
   html = html.replace('${BASE_URL}', env.BASE_URL);

   // Send the modified HTML file
   res.send(html);
});

emailEvents();

// app.use("/api", PublicRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/admin/dashboard", DashboardRoutes);

app.use("/uploads", express.static(path.join(__dirname, "storage/uploads")));

const listApis = listEndpoints(app);

console.table(listApis);
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handlePayload: HandlePayload = new HandlePayload(listApis);

(async () => {
   try {
      await connectDB().then(() => {
         app.listen(env.APP_PORT, () => {
            console.log(`listening at http://localhost:${env.APP_PORT}`);
            console.log(`Api docs at http://localhost:${env.APP_PORT}/api/api-docs `);
         });
      });
   } catch (error) {
      console.error("Startup error:", error);
      process.exit(1);
   }
})();
