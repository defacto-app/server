import { z } from "zod";

const messages = {
   required: (field: string) => `${field} is required`,
   invalid: (field: string) => `Please enter a valid ${field.toLowerCase()}`,
   minLength: (field: string, min: number) =>
      `${field} must be at least ${min} character${min === 1 ? "" : "s"} long`,
   maxLength: (field: string, max: number) =>
      `${field} cannot exceed ${max} characters`,
   number: {
      positive: (field: string) => `${field} must be a positive number`,
      min: (field: string, min: number) => `${field} must be at least ${min}`,
      max: (field: string, max: number) => `${field} must not exceed ${max}`,
   },
};
// Create Zod schema for the AddressType
const openingHoursSchema = z.object({
   open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
   close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
   isClosed: z.boolean().default(false),
});

const addressSchema = z.object({
   branchName: z.string().optional(), // Assuming branchName can be optional
   fullAddress: z
      .string()
      .min(5, messages.minLength("Address", 5))
      .max(500, messages.maxLength("Address", 500))
      .trim(),
   coordinates: z
      .object({
         latitude: z.number(),
         longitude: z.number(),
      })
      .optional(), // Coordinates are optional
   additionalDetails: z.string().optional(), // Additional details are optional
});

export const updateRestaurantSchema = z.object({
   name: z
      .string()
      .min(2, messages.minLength("Name", 2))
      .max(255, messages.maxLength("Name", 255))
      .trim(),
   category: z.string().min(1, "Category is required"),

   address: addressSchema.optional(), // Updated to expect an address object
   phone: z
      .string()
      .min(8, messages.minLength("Phone number", 8))
      .max(20, messages.maxLength("Phone number", 20))
      .regex(/^[+\d\s-()]+$/, messages.invalid("phone number")),
   email: z
      .string()
      .email(messages.invalid("email address"))
      .trim()
      .toLowerCase(),

   openingHours: z
      .object({
         monday: openingHoursSchema,
         tuesday: openingHoursSchema,
         wednesday: openingHoursSchema,
         thursday: openingHoursSchema,
         friday: openingHoursSchema,
         saturday: openingHoursSchema,
         sunday: openingHoursSchema,
      })
      .optional(),
});

export const createRestaurantSchema = z.object({
   name: z
      .string()
      .min(2, messages.minLength("Name", 2))
      .max(255, messages.maxLength("Name", 255))
      .trim(),
   category: z.string().min(1, "Category is required"),
   address: z.object({
      branchName: z.string().optional(),
      fullAddress: z.string().min(1, "Full address is required"),
      //  coordinates: z.array(z.number()).length(2, "Coordinates must be a [latitude, longitude] pair"),
      additionalDetails: z.string().optional(),
   }),
   phone: z
      .string()
      .min(8, messages.minLength("Phone number", 8))
      .max(20, messages.maxLength("Phone number", 20))
      .regex(/^[+\d\s-()]+$/, messages.invalid("phone number")),
   email: z
      .string()
      .email(messages.invalid("email address"))
      .trim()
      .toLowerCase(),
   openingHours: z.object({
      monday: openingHoursSchema,
      tuesday: openingHoursSchema,
      wednesday: openingHoursSchema,
      thursday: openingHoursSchema,
      friday: openingHoursSchema,
      saturday: openingHoursSchema,
      sunday: openingHoursSchema,
   }),
   deliveryTime: z.object({
      min: z
         .number()
         .positive("Minimum delivery time must be a positive number"),
      max: z
         .number()
         .positive("Maximum delivery time must be a positive number"),
   }),
});
