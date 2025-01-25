import { z } from "zod";

// Create location schema (reusable)

// Create address schema (reusable)
const locationSchema = z.object({
   lat: z.number(),
   lng: z.number(),
});

// Separate schemas for pickup and dropoff addresses with distinct error messages
const pickupAddressSchema = z
   .object({
      address: z.string().min(1, "Pickup address is required"),
      additionalDetails: z.string().optional(),
      location: locationSchema,
   })
   .refine((data) => data.address.length > 0, {
      message: "Pickup address is required",
      path: ["address"], // This ensures the error appears on the address field
   });

const dropOffAddressSchema = z
   .object({
      address: z.string().min(1, "Drop-off address is required"),
      additionalDetails: z.string().optional(),
      location: locationSchema,
   })
   .refine((data) => data.address.length > 0, {
      message: "Drop-off address is required",
      path: ["address"],
   });

// Main package delivery schema
const packageDeliverySchema = z.object({
   description: z.string().min(1, "Description is required"),
   package_image: z.string().optional(),
   charge: z.number().min(0, "Charge must be greater than or equal to 0"),
   pickupDate: z.string().datetime("Invalid date format"),
   pickupDetails: z.object({
      address: pickupAddressSchema,
   }),
   dropOffDetails: z.object({
      address: dropOffAddressSchema,
      name: z.string().min(1, "Recipient name is required"),
      phone: z
         .string()
         .min(1, "Phone number is required")
         .regex(/^[0-9+\s-()]{10,}$/, "Invalid phone number format"),
      email: z.preprocess(
         (val) => (val === "" ? undefined : val),
         z.string().email("Invalid email format").optional()
      ),
   }),
});

type ValidationResponse = {
   success: boolean;
   data: z.infer<typeof packageDeliverySchema> | null;
   errors: Record<string, string> | null;
};

// Address schema (reusable)
const addressSchema = z
   .object({
      location: locationSchema,
      address: z.string().min(1, "Address is required"),
      additionalDetails: z.string().optional(),
   })
   .refine((data) => data.address.length > 0, {
      message: "Address is required",
      path: ["address"],
   });

// Order item schema
const orderItemSchema = z.object({
   publicId: z.string().uuid("Invalid item ID"),
   quantity: z.number().int().positive("Quantity must be at least 1"),
   name: z.string().min(1, "Item name is required"),
   price: z.number().positive("Price must be greater than 0"),
});

// Main restaurant order schema
const restaurantOrderSchema = z.object({
   restaurantOrder: z
      .array(orderItemSchema)
      .min(1, "At least one item is required"),
   restaurantId: z.string().uuid("Invalid restaurant ID"),
   charge: z.number().min(0, "Charge must be greater than or equal to 0"),
   deliveryFee: z
      .number()
      .min(0, "Delivery fee must be greater than or equal to 0"),
   dropOffDetails: z.object({
      address: addressSchema,
      name: z.string().min(1, "Recipient name is required"),
      email: z.preprocess(
         (val) => (val === "" ? undefined : val),
         z.string().email("Invalid email format").optional()
      ),
      phoneNumber: z
         .string()
         .min(1, "Phone number is required")
         .regex(/^[0-9+\s-()]{10,}$/, "Invalid phone number format"),
   }),
});

export const OrderValidator = {
   validateDelivery: async (body: any): Promise<ValidationResponse> => {
      try {
         const result = packageDeliverySchema.safeParse(body);

         if (!result.success) {
            const formattedErrors = result.error.errors.reduce(
               (acc, error) => {
                  const path = error.path.join(".");
                  acc[path] = error.message;
                  return acc;
               },
               {} as Record<string, string>
            );

            return {
               success: false,
               data: null, // Explicitly setting to null when validation fails
               errors: formattedErrors,
            };
         }

         return {
            success: true,
            data: result.data, // Ensure the data type matches z.infer<typeof packageDeliverySchema>
            errors: null,
         };
      } catch (error: any) {
         return {
            success: false,
            data: null, // Explicitly setting to null when an exception occurs
            errors: { _error: error.message },
         };
      }
   },

   restaurant: async (body: any): Promise<ValidationResponse> => {
      try {
         const result = restaurantOrderSchema.safeParse(body);

         if (!result.success) {
            const formattedErrors = result.error.errors.reduce(
               (acc, error) => {
                  const path = error.path.join(".");
                  acc[path] = error.message;
                  return acc;
               },
               {} as Record<string, string>
            );

            return {
               success: false,
               data: null,
               errors: formattedErrors,
            };
         }

         return {
            success: true,
            data: result.data as any, // Type assertion ensures compatibility
            errors: null,
         };
      } catch (error: any) {
         return {
            success: false,
            data: null,
            errors: { _error: error.message },
         };
      }
   },
};
//
//
//
//
//
