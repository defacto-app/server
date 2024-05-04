import express from "express";
import env from "./config/env";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import listEndpoints from "express-list-endpoints";
import path from "path";
import fs from "fs";

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//  routes
import DashboardRoutes from "./backend/routes/admin/dashboard.routes";
import AuthRoutes from "./backend/routes/auth.routes";
import UserRoutes from "./backend/routes/user/user.routes";
import PackageRoutes from "./backend/routes/user/package.routes";
import EmailViewRoutes from "./backend/routes/email.routes";
import { connectDB } from "./config/mongodb";

import { emailEvents } from "./config/eventEmitter";
import { HandlePayload } from "./config/utils/api-routes";
import swaggerUi from "swagger-ui-express";


import swaggerDocument from "./storage/json/swagger.json";
import winston from "winston";

const app = express();





app.use(cors());

app.use(express.json());

app.use(
   session({
      secret: "your_secret_key", // Replace with a real secret key
      resave: false,
      saveUninitialized: false,
   })
);

app.use((err:any, req:any, res:any, next:any) => {
   console.error(err);
   res.status(500).send('Internal Server Error');
});

app.use(morgan(':method :url :status :response-time ms'));


const options = {
   swaggerOptions: {
      validatorUrl: null,
   },
};

app.use(
   "/api/api-docs",
   (
      req: any,
      res: { set: (arg0: string, arg1: string) => void },
      next: () => void
   ) => {
      res.set("Cache-Control", "no-store");
      next();
   },
   swaggerUi.serve,
   swaggerUi.setup(swaggerDocument, options)
);

app.get("/", (req, res) => {
   // Read the HTML file on every request
   fs.readFile(path.join(__dirname, "public/index.html"), 'utf8', (err, html) => {
      if (err) {
         console.error("Error reading HTML file:", err);
         res.status(500).send("Internal Server Error");
         return;
      }

      // Replace ${BASE_URL} with the actual base URL
      html = html.replace('${BASE_URL}', env.BASE_URL);

      // Send the modified HTML file
      res.send(html);
   });
});

emailEvents();


// Use response-time middleware to automatically calculate response times
const logger = winston.createLogger({
   level: 'info',
   format: winston.format.json(),
   defaultMeta: { service: 'app-service' },
   transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
   ],
});

if (process.env.NODE_ENV !== 'production') {
   logger.add(new winston.transports.Console({
      format: winston.format.simple(),
   }));
}

// Custom middleware to use with Winston
app.use((req, res, next) => {
   const start = Date.now();

   res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
   });

   next();
});


// Use the custom logging middleware

// app.use("/api", PublicRoutes);
app.use("/api/v1/packages", PackageRoutes);
app.use("/api/v1/packages", PackageRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/admin/dashboard", DashboardRoutes);
app.use("/api/v1/preview/", EmailViewRoutes);



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
