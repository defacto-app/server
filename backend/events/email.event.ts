import { eventEmitter } from "../../config/eventEmitter";

const EmailEvent = {
   async sendContactMail(data: { email: string; message: string }) {
      try {
         eventEmitter.emit("sendContactMail", data);
      } catch (e) {
         console.error("Error during update:", e);
      }
   },
};

export default EmailEvent;
