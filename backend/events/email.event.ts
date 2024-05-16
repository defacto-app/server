import { eventEmitter } from "../../config/eventEmitter";
import { getEmailTemplates } from "../libs/emailParser";

const EmailEvent = {
   async sendContactMail(data: { email: string; message: string }) {
      try {
         eventEmitter.emit("sendContactMail", data);
      } catch (e) {
         console.error("Error during update:", e);
      }
   },

   async sendWelcomeMail(data: { email: string; link: string }) {
      const compileEmail = getEmailTemplates("verify-email", data);
      const html = compileEmail({ link: data.link });
      try {
         eventEmitter.emit("sendWelcomeMail", {
            email: data.email,
            html: html,
            message: "Welcome to Defacto",
         });
      } catch (e) {
         console.error("Error during update:", e);
      }
   },
};

export default EmailEvent;
