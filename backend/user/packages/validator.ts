import { z } from "zod";

// Coordinate Schema
const CoordinatesSchema = z.object({
	lat: z
		.number()
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	lng: z
		.number()
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
});

// Contact Details Schema
const ContactDetailsSchema = z.object({
	name: z.string().min(1, "Name is required"),
	phone: z.string().min(1, "Phone number is required"),
	email: z.string().email("Invalid email format"),
	address: z.string().min(1, "Address is required"),
	location: z.string().min(1, "Location is required"),
	coordinates: CoordinatesSchema, // Ensure this matches the exact field name expected in the input
});

// Cash Available Schema
const CashAvailableSchema = z.object({
	available: z.boolean(),
	amount: z.number().min(0, "Amount cannot be negative"),
});

// Package Content Schema (array of strings)
const PackageContentSchema = z.array(
	z.string().min(1, "Content item cannot be empty"),
);

// Complete schema for updating a package
const UpdatePackageSchema = z.object({
	description: z.string().min(10, "Description must be at least 10 characters"),
	charge: z.number().min(1, "Charge must be a positive number"),
	cashAvailable: CashAvailableSchema,
	contactDetails: ContactDetailsSchema.optional(),
	packageContent: PackageContentSchema.optional(),
});

export default {
	update: async (body: any) => {
		const result = UpdatePackageSchema.safeParse(body);
		if (!result.success) {
			const formattedErrors: any = {};
			result.error.errors.forEach((error) => {
				// Join the path to create a nested field name if needed
				const fieldName = error.path.join(".");
				formattedErrors[fieldName] = error.message;
			});
			return { data: null, error: formattedErrors };
		}
		return { data: result.data, error: null };
	},
};
