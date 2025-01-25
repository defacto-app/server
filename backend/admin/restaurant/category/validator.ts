import { z } from "zod";

export const categoryValidator = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .nonempty("Name is required"), // Ensures the string is not empty
    description: z
    .string()
    .max(1024, "Description must be 1024 characters or less")
    .optional()
    .nullable(),
  categoryType: z.enum(["restaurant", "menu"]),
  active: z.boolean().optional().default(true),
});