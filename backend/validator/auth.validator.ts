import { parsePhoneNumberFromString } from "libphonenumber-js";


export default {
   validPhoneNumber: async function(body: any) {
      const phoneNumber = body.phoneNumber;

      // Input validation (optional):
      if (!phoneNumber || typeof phoneNumber !== 'string') {
         throw new Error('Invalid phone number format. Please provide a string value.');
      }
      try {
         const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // 'NG' is the country code for Nigeria



         if (!parsedNumber?.isValid()) {
            throw new Error('Invalid phone number. Please check the format and ensure it follows Nigerian standards.');
         }

         const data = {
            phoneNumber: parsedNumber?.number,
            country: parsedNumber?.country,
            valid: true,
         };

         return { data, error: null };
      } catch (e: any) {
         return { data: null, error: e.message };
      }
   },
};