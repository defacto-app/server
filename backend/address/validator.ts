import { z } from "zod";




const PackageContentSchema = z.array(z.string());
export default {
	update_package: async (body: any) => {
		const bodySchema = z.object({
			name: z.string().min(2),
			description: z.string().min(10),
			price: z.number().min(1),
			content: PackageContentSchema,
			available: z.boolean(),
		});

		const result = bodySchema.safeParse(body);
		if (!result.success) {
			const formattedErrors: any = {};
			for (const error of result.error.errors) {
				const fieldName = error.path[0];
				formattedErrors[fieldName] = error.message;
			}

			return { data: null, error: formattedErrors };
		}

		return { data: result.data, error: null };
	},
};
