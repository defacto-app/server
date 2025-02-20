import { z } from "zod";

// Define the schema for menu validation
export const createMenuSchema = z.object({
   name: z.string().min(1, "Name is required"),
   category: z.string().min(1, "Please chose a catgory for the menu"),
   price: z.coerce.number().positive("Price must be a positive number"),
   description: z.string().min(1, "Description is required").optional(),
   available: z.boolean(),
   quantity: z.number().positive("Quantity must be a positive number"),
   image: z.string().url("Image must be a valid URL").optional(),
   categoryId: z.string().min(1, "Category ID is required"),
});

export const updateMenuSchema = z.object({
   name: z.string().min(1, "Name is required").optional(),
   description: z.string().min(1, "Description is required").optional(),
   quantity: z.number().positive("Quantity must be a positive number").optional(),
   price: z.coerce
      .number()
      .positive("Price must be a positive number")
      .optional(),
   available: z.boolean().optional(),
   image: z.string().url("Image must be a valid URL").optional(),
   categoryId: z.string().min(1, "Category ID is required").optional(),
});
