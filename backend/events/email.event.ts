import { eventEmitter } from "../../config/eventEmitter";
import { getEmailTemplates } from "../libs/emailParser";
import env from "../../config/env";

const EmailEvent = {
   async sendContactMail(data: { fullName:string; phoneNumber:string; email: string; message: string }) {
      const compileEmail = getEmailTemplates("contact");

      const html = compileEmail({
         fullName: data.fullName,
         phoneNumber: data.phoneNumber,
         email: data.email,
         message: data.message,
      });

      try {
         eventEmitter.emit("sendContactMail", {
            email: env.EMAIL_SENDER,
            html: html,
            message: `${data.fullName} has sent you a message`,
         });
      } catch (e) {
         console.error("Error during update:", e);
      }
   },

   async sendWelcomeMail(data: { email: string; link: string }) {
      const compileEmail = getEmailTemplates("verify-email");
      const html = compileEmail({ link: data.link });
      try {
         eventEmitter.emit("sendWelcomeMail", {
            email: data.email,
            html: html,
            message: `Welcome to ${env.APP_NAME}`,
         });
      } catch (e) {
         console.error("Error during update:", e);
      }
   },

   async sendPasswordResetMail(data: { email: string; link: string }) {
      const compileEmail = getEmailTemplates("verify-email");
      const html = compileEmail({ link: data.link });
      try {
         eventEmitter.emit("sendWelcomeMail", {
            email: data.email,
            html: html,
            message: `Welcome to ${env.APP_NAME}`,
         });
      } catch (e) {
         console.error("Error during update:", e);
      }
   },

   async sendOtpMail(data: { email: string; otp: string }) {
      const compileEmail = getEmailTemplates("otp");
      const html = compileEmail({ otp: data.otp });
      try {
         eventEmitter.emit("sendOtpMail", {
            email: data.email,
            html: html,
            message: "one time Otp",
         });
      } catch (e) {
         console.error("Error during update:", e);
      }
   },
   async sendOtpChnageMail(data: { email: string; otp: string }) {
      const compileEmail = getEmailTemplates("email-change");
      const html = compileEmail({ otp: data.otp });
      try {
         eventEmitter.emit("sendOtpMail", {
            email: data.email,
            html: html,
            message: "one time Otp",
         });
      } catch (e) {
         console.error("Error during update:", e);
      }
   },
};

export default EmailEvent;
