import { z } from "zod";

// Define the schema for menu validation
export const createMenuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Please chose a catgory for the menu"),
  price: z.coerce.number().positive("Price must be a positive number"),
  available: z.boolean(),
  image: z.string().url("Image must be a valid URL").optional(),
  categoryId: z.string().min(1, "Category ID is required"),
});


export const updateMenuSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  price: z.coerce.number().positive("Price must be a positive number").optional(),
  available: z.boolean().optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
});