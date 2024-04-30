import axios from "axios";
import env from "../../config/env";

export interface ApiResponse<T> {
   data: T | null;
   error: any | null;
   success?: boolean;
   timestamp?: Date;
}



export async function sendTokenSms(otp: string, phoneNumber: string): Promise<ApiResponse<any>> {
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
         success: true,
         error: null,
      };
   } catch (error: any) {
      let errorMessage = "An unexpected error occurred";
      if (axios.isAxiosError(error)) {
         errorMessage = error.response?.data.message || "An error occurred during the request";
      }

      return {
         data: null,
         success: false,
         error: errorMessage,
      };
   }
}
