import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
import { authBodyType } from "../../types";

const PhoneNumberSchema = z.object({
   phoneNumber: z
      .string()
      .nonempty({ message: "Phone number is required." })
      .refine((value) => value.trim().length >= 10, {
         message: "Phone number must have at least 10 digits.",
      }),
});

export default {
   phone_register: async function (body: authBodyType) {
      const phone_register_schema = z.object({
         phoneNumber: z.string().nonempty({
            message: "Phone number is required.",
         }),
         otp: z.string().min(5, {
            message: "OTP must be at least 5 characters long.",
         }),
      });

      try {
         // Validate the initial schema
         const result = phone_register_schema.safeParse(body);
         if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.errors.forEach((error) => {
               const fieldName = error.path.join(".");
               formattedErrors[fieldName] = error.message;
            });
            return { data: null, error: formattedErrors };
         }

         // Parse and validate the phone number
         const { phoneNumber } = result.data;
         const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // NG for Nigeria
         if (!parsedNumber?.isValid()) {
            return {
               data: null,
               error: {
                  phoneNumber:
                     "Invalid phone number. Please check the format and ensure it follows Nigerian standards.",
               },
            };
         }
         const data = {
            phoneNumber: parsedNumber?.number,
            country: parsedNumber?.country,
            valid: true,
         };
         // If all validations are passed, return the valid data
         return {
            data,
            error: null,
         };
      } catch (e: any) {
         return { data: null, error: e.message };
      }
   },

   email_register: async function (body: authBodyType) {
      try {
         const registerSchema = z.object({
            email: z
               .string()
               .email({ message: "Invalid email address." })
               .optional(),
            password: z.string().min(6, {
               message: "Password must be at least 6 characters long.",
            }),
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
   },
   admin_login: async function (body: authBodyType) {
      try {
         const registerSchema = z.object({
            email: z
               .string()
               .email({ message: "Invalid email address." })
               .optional(),
            otp: z.string().min(6, {
               message: "OTP must be at least 6 characters long.",
            }),
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
   },


   email_login: async function (body: authBodyType) {
      const loginSchema = z.object({
         email: z.string().email({ message: "Invalid email address." }),
         password: z.string().min(6, {
            message: "Password must be at least 6 characters long.",
         }),
      });

      const result = loginSchema.safeParse(body);

      if (!result.success) {
         const formattedErrors: any = {};
         result.error.errors.forEach((error) => {
            const fieldName = error.path[0];
            formattedErrors[fieldName] = error.message;
         });
         return { data: null, error: formattedErrors };
      }

      return { data: result.data, error: null };
   },
   phone_login: async function (body: any) {
      try {
         // Define the authBodyType using Zod to ensure both phoneNumber and password are included
         const AuthBodySchema = z.object({
            phoneNumber: z.string().nonempty({
               message: "Phone number is required.",
            }),
            otp: z.string().min(5, {
               message: "OTP must be at least 5 characters long.",
            }),
         });
         // Validate the initial schema
         const result = AuthBodySchema.safeParse(body);
         if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.errors.forEach((error) => {
               const fieldName = error.path.join(".");
               formattedErrors[fieldName] = error.message;
            });
            return { data: null, error: formattedErrors };
         }

         // Parse and validate the phone number
         const { phoneNumber } = result.data;
         const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // NG for Nigeria
         if (!parsedNumber?.isValid()) {
            return {
               data: null,
               error: {
                  phoneNumber:
                     "Invalid phone number. Please check the format and ensure it follows Nigerian standards.",
               },
            };
         }


         return {
            data: {
               phoneNumber: parsedNumber.number, // or parsedNumber.formatInternational() for a formatted number
               otp: result.data.otp,
            },
            error: null,
         };
      } catch (e: any) {
         return { data: null, error: e.message };
      }
   },

   phone_number: async function (body: any) {
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

   email_address: async function (body: any) {
      const emailSchema = z.object({
         email: z.string().email({ message: "Invalid email address." }),
      });

      const result = emailSchema.safeParse(body);
      if (!result.success) {
         const formattedErrors: any = {};
         result.error.errors.forEach((error) => {
            const fieldName = error.path[0];
            formattedErrors[fieldName] = error.message;
         });

         return { data: null, error: formattedErrors };
      }

      return { data: result.data, error: null };
   }
};
