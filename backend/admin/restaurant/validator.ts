import { z } from "zod";

// Create Zod schema for the AddressType
const openingHoursSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isClosed: z.boolean().default(false)
});

const addressSchema = z.object({
  branchName: z.string().optional(),  // Assuming branchName can be optional
  fullAddress: z.string().min(1),      // Ensure the fullAddress is at least 1 character long
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),                      // Coordinates are optional
  additionalDetails: z.string().optional()  // Additional details are optional
});




export const updateRestaurantSchema = z.object({

  name: z.string().min(1).optional(),
  categories: z.array(z.string()).optional(),
  address: addressSchema.optional(),  // Updated to expect an address object
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  openingHours: z.object({
    monday: openingHoursSchema,
    tuesday: openingHoursSchema,
    wednesday: openingHoursSchema,
    thursday: openingHoursSchema,
    friday: openingHoursSchema,
    saturday: openingHoursSchema,
    sunday: openingHoursSchema
  }).optional()
});