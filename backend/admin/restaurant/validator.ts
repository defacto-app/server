import { z } from "zod";

// Create Zod schema for the AddressType
const openingHoursSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isClosed: z.boolean().default(false)
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
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