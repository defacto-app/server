import fetch from "nodemailer/lib/fetch";
import axios from "axios";
import { generateOTP } from "../utils/utils";
import env from "../../config/env";

const OTP = generateOTP(5);




export async function sendSms(otp:any, phoneNumber:any) {
   const url = "https://api.ng.termii.com/api/sms/otp/send";

   const payload = {
      api_key: env.TERMIAPIKEY,
      message_type: "NUMERIC",
      to: `2348063145125`,
      from: "N-Alert",
      channel: "dnd",
      pin_attempts: 60,
      pin_time_to_live: 10,
      pin_length: 6,
      pin_placeholder: "< 1234 >",
      message_text: `Your Defacto authentication code is ${12300}. Expires in 1 hour`,
      pin_type: "NUMERIC",
   };


   const { data } = await axios.post(url, payload);

   return data;

}
