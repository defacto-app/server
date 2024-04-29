import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

const PhoneNumberSchema = z.object({
   phoneNumber: z.string().refine(value => value.trim() !== '' && value.trim().length >= 10, {
      message: 'Phone number must not be empty and must have at least 10 digits.',
   }),
});

export default {
   validPhoneNumber: async function(body: any) {


      const result = PhoneNumberSchema.safeParse(body);
      if (!result.success) {
         const formattedErrors: any = {};
         result.error.errors.forEach((error) => {
            const fieldName = error.path[0];
            formattedErrors[fieldName] = error.message;
         });

         console.log("formattedErrors", formattedErrors);
         return { data: null, error: formattedErrors };
      }
      console.log("parsed", result);


      const { phoneNumber } = result.data;

      try {

         const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // 'NG' is the country code for Nigeria


         if (!parsedNumber?.isValid()) {
            throw new Error("Invalid phone number. Please check the format and ensure it follows Nigerian standards.");
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