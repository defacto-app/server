import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
import { registerBody } from "../../types";

const PhoneNumberSchema = z.object({
   phoneNumber: z
      .string()
      .nonempty({ message: "Phone number is required." })
      .refine((value) => value.trim().length >= 10, {
         message: "Phone number must have at least 10 digits.",
      }),
});

export default {
   validPhoneNumber: async function (body: any) {
      const result = PhoneNumberSchema.safeParse(body);
      if (!result.success) {
         const formattedErrors: any = {};
         result.error.errors.forEach((error) => {
            const fieldName = error.path[0];
            formattedErrors[fieldName] = error.message;
         });

         return { data: null, error: formattedErrors };
      }
      const { phoneNumber } = result.data;
      try {
         const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // 'NG' is the country code for Nigeria
         if (!parsedNumber?.isValid()) {
            throw new Error(
               "Invalid phone number. Please check the format and ensure it follows Nigerian standards."
            );
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

   register: async function (body: registerBody) {
      // use zod to validate the body

      try {
         const registerSchema = z.object({
            email: z
               .string()
               .email({ message: "Invalid email address." }).optional(),
            password: z
               .string()
               .min(6, { message: "Password must be at least 6 characters long." }),
            phoneNumber: z.string().optional(),

         }).refine((data) => {
            if (!data.email && !data.phoneNumber) {
               throw new Error("At least one of email or phoneNumber must be provided.");
            }
            return true;
         });


         const result = registerSchema.safeParse(body);

         // if there are errors, return the errors

         if (!result.success) {
            const formattedErrors: any = {};
            result.error.errors.forEach((error) => {
               const fieldName = error.path[0];
               formattedErrors[fieldName] = error.message;
            });
            return { data: null, error: formattedErrors };
         }

         // if there are no errors, return the data

         return { data: result.data, error: null };
      } catch (e: any) {
         return { data: null, error: e.message };
      }
   }
};
