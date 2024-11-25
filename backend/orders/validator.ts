import { z } from "zod";

// Create location schema (reusable)


// Create address schema (reusable)
const locationSchema = z.object({
	lat: z.number(),
	lng: z.number()
});

// Separate schemas for pickup and dropoff addresses with distinct error messages
const pickupAddressSchema = z.object({
	address: z.string().min(1, "Pickup address is required"),
	additionalDetails: z.string().optional(),
	location: locationSchema,
}).refine(
	(data) => data.address.length > 0,
	{
		message: "Pickup address is required",
		path: ["address"] // This ensures the error appears on the address field
	}
);

const dropOffAddressSchema = z.object({
	address: z.string().min(1, "Drop-off address is required"),
	additionalDetails: z.string().optional(),
	location: locationSchema,
}).refine(
	(data) => data.address.length > 0,
	{
		message: "Drop-off address is required",
		path: ["address"]
	}
);

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
			z.string().email("Invalid email format").optional(),
		),
	}),
});

type ValidationResponse = {
	success: boolean;
	data: z.infer<typeof packageDeliverySchema> | null;
	errors: Record<string, string> | null;
};

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
					{} as Record<string, string>,
				);

				return {
					success: false,
					data: null,
					errors: formattedErrors,
				};
			}

			return {
				success: true,
				data: result.data,
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
