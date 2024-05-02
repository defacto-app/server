import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";



export function formatErrors(errors: any[]) {
   const formattedErrors: Record<string, string> = {};
   errors.forEach((error) => {
      const fieldName = error.path.join(".");
      formattedErrors[fieldName] = error.message;
   });
   return formattedErrors;
}

export const PhoneNumberSchema = z.object({
   phoneNumber: z
      .string()
      .nonempty({ message: "Phone number is required." })
      .refine((value) => value.trim().length >= 10, {
         message: "Phone number must have at least 10 digits.",
      }),
});




/*

{
  "message": "Invalid phone number",
  "success": false,
  "timestamp": "2024-05-02T14:29:54.704Z",
  "error": {
    "phoneNumber": "Phone number must have at least 10 digits."
  }
}
* */