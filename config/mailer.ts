import nodemailer from "nodemailer";
import env from "./env";

const transporter = nodemailer.createTransport({
   host: env.EMAIL_HOST,
   port: env.EMAIL_PORT,
   secure: false, // true for 465, false for other ports
   auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
   },
});

export default transporter;
