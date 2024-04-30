import axios from "axios";
import env from "../../config/env";

interface SmsResponse {
   pinId: string;
   to: string;
   smsStatus: string;
}

export async function sendTokenSms(otp: any, phoneNumber: any) {
   const url = "https://api.ng.termii.com/api/sms/otp/send";

   const payload = {
      api_key: env.TERMIAPIKEY,
      message_type: "NUMERIC",
      to: phoneNumber,
      from: "N-Alert",
      channel: "dnd",
      pin_attempts: 60,
      pin_time_to_live: 10,
      pin_length: 6,
      pin_placeholder: "< 1234 >",
      message_text: `Your Defacto authentication code is ${otp}. Expires in 10 Minutes`,
      pin_type: "NUMERIC",
   };

   try {
      const { data } = await axios.post(url, payload);
      return {
         data: data,
         error: null,
      };
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         const message = error.response?.data.message;
         console.log(message); // or handle the message however you need

         console.error("Error sending SMS", message);

         return {
            data: null,
            error: message,
         };
      }
   }
}
