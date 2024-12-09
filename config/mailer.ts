import nodemailer from "nodemailer";
import env from "./env";

const transporter = nodemailer.createTransport({
	host: env.EMAIL_HOST,
	port: env.EMAIL_PORT,
	secure: false, // Changed from true to false
	auth: {
		user: env.EMAIL_USER,
		pass: env.EMAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
		minVersion: "TLSv1.2", // Added minimum TLS version
	},
});

// Add a verification step to test the connection
transporter.verify((error) => {
	if (error) {
		console.log("Server connection failed:", error);
	} else {
		console.log("Server is ready to take our messages");
	}
});

export default transporter;
