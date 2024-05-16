// eventEmitter.ts
import { EventEmitter } from "events";
import transporter from "./mailer";
// import {autoLoadedConfig} from "../backend/model/db-config.model";

export const eventEmitter = new EventEmitter();

export const emailEvents = () => {
   eventEmitter.on("sendContactMail", async (payload: any) => {
      try {
         // Use the transporter to send the email
         const info = await transporter.sendMail({
            from: '"Sender Name" <sender@example.com>',
            to: "sender@gmail.com", // Pulled from event payload
            subject: "Contact Email Subject",
            text: payload.message, // Pulled from event payload
            // html: '<b>Hello world?</b>' // html body
         });

         console.log("Message sent: %s", info.messageId);
      } catch (error) {
         console.error("Error handling contact mail event", error);
      }
   });

   eventEmitter.on("sendWelcomeMail", async (payload: any) => {
      try {
         // Use the transporter to send the email
         const info = await transporter.sendMail({
            from: '"Sender Name" <sender@example.com>',
            to: payload.email, // Pulled from event payload
            subject: "Welcome to Defacto",
            html: payload.html, // Pulled from event payload
         });

         console.log("Message sent: %s", info.messageId);
      } catch (error) {
         console.error("Error handling contact mail event", error);
      }
   });
};
