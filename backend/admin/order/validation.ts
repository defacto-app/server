import { z } from "zod";

// Create Zod schema for the AddressType
const AddressTypeSchema = z.object({
   street: z.string(),
   city: z.string(),
   state: z.string(),
   zipCode: z.string(),
});

// Create Zod schema for dropOffDetails and pickupDetails
const DetailsSchema = z.object({
   name: z.string().min(1, "Name is required"),
   phone: z.string().min(1, "Phone number is required"),
   email: z.string().email("Invalid email format"),
   address: AddressTypeSchema,
});

// Zod schema for cashAvailable
const CashAvailableSchema = z.object({
   available: z.boolean(),
   amount: z.number().min(0, "Amount must be a positive number"),
});

// Define the schema for the order request body
export const CreateOrderSchema = z.object({
   type: z.enum(["food", "package"]),
   dropOffDetails: DetailsSchema,
   pickupDetails: DetailsSchema,
   charge: z.number().positive("Charge must be a positive number"),
   pickupTime: z.string().optional().transform((str) => (str ? new Date(str) : null)),
   assignedTo: z.string().optional(),
   isInstant: z.boolean().optional(),
   deliveryMode: z.enum(["Motorcycle", "Tricycle", "Bicycle", "Foot"]),
   description: z.string().optional(),
   cashPaymentLocation: z.enum(["Pick-up", "Delivery"]),
   cashAvailable: CashAvailableSchema,
   menuItems: z.array(
      z.object({
         name: z.string(),
         quantity: z.number().positive(),
         price: z.number().positive(),
      })
   ).optional(),
   packageContent: z.array(z.string()).optional(),
});

