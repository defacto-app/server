import express from "express";
import env from "./config/env";
import cors from "cors";
import session from "express-session";
import listEndpoints from "express-list-endpoints";
import path from "node:path";
import logger from "./config/logger";
import fs from "node:fs";

import swaggerUi from "swagger-ui-express";

import { fileURLToPath } from "node:url";

import { connectDB } from "./config/mongodb";
import { emailEvents } from "./config/eventEmitter";
import { HandlePayload } from "./config/utils/api-routes";
import swaggerDocument from "./storage/json/swagger.json";
//  routes
import DashboardRoutes from "./backend/routes/admin/dashboard.routes";
import AuthRoutes from "./backend/auth/routes";
import UserRoutes from "./backend/routes/user/user.routes";
import PackageRoutes from "./backend/user/packages/route";
import RestaurantRoutes from "./backend/resturant/route";
import AddressRoutes from "./backend/address/route";
import EmailViewRoutes from "./backend/routes/email.routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// list out files
console.log(`Current directory: ${process.cwd()}`);

try {
	const viewsPath = path.join(__dirname, "views");
	const files = fs.readdirSync(viewsPath);
	console.log("Files in the views directory:", files);
} catch (err) {
	console.error("Error accessing the views directory:", err);
}

app.use(cors());

app.use(express.json());

app.use(
	session({
		secret: "your_secret_key", // Replace with a real secret key
		resave: false,
		saveUninitialized: false,
	}),
);

const options = {
	swaggerOptions: {
		validatorUrl: null,
	},
};

app.use(
	"/api/api-docs",
	(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		req: any,
		res: { set: (arg0: string, arg1: string) => void },
		next: () => void,
	) => {
		res.set("Cache-Control", "no-store");
		next();
	},
	swaggerUi.serve,
	swaggerUi.setup(swaggerDocument, options),
);

app.get("/", (req, res) => {
	// Read the HTML file on every request
	fs.readFile(
		path.join(__dirname, "public/index.html"),
		"utf8",
		(err, fileContent) => {
			if (err) {
				console.error("Error reading HTML file:", err);
				res.status(500).send("Internal Server Error");
				return;
			}

			// Replace ${BASE_URL} with the actual base URL
			const modifiedContent = fileContent.replace("${BASE_URL}", env.BASE_URL);

			// Send the modified HTML file
			res.send(modifiedContent);
		},
	);
});

emailEvents();

// Use response-time middleware to automatically calculate response times

// Custom middleware to use with Winston
app.use((req, res, next) => {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info(
			`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
		);
	});

	next();
});

// Use the custom logging middleware
// app.use("/api", PublicRoutes);
app.use("/api/v1/address", AddressRoutes);
app.use("/api/v1/packages", PackageRoutes);
app.use("/api/v1/restaurants", RestaurantRoutes);
// app.use("/api/v1/restaurant", RestaurantRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/admin/dashboard", DashboardRoutes);
app.use("/api/v1/preview/", EmailViewRoutes);

app.use("/uploads", express.static(path.join(__dirname, "storage/uploads")));
app.use("/assets", express.static(path.join(__dirname, "storage/assets")));

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
				console.log(
					`Api docs at http://localhost:${env.APP_PORT}/api/api-docs `,
				);
			});
		});
	} catch (error) {
		console.error("Startup error:", error);
		process.exit(1);
	}
})();
