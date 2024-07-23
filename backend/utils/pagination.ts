// utils/pagination.ts
import type { Model, Document } from "mongoose";

interface PaginationResult<T> {
	success: boolean;
	data: T[];
	pagination: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
	timestamp: Date;
}

async function paginate<T extends Document>(
	model: Model<T>,
	page: number,
	perPage: number,
	query: object,
	projection?: object,
): Promise<PaginationResult<T>> {
	try {
		const total = await model.countDocuments(query);
		const totalPages = Math.ceil(total / perPage);
		const data = await model
			.find(query, projection)
			.skip((page - 1) * perPage)
			.limit(perPage);

		return {
			pagination: {
				page,
				perPage,
				total,
				totalPages,
			},
			timestamp: new Date(),
			success: true,
			data,
		};
	
	} catch (error: any) {
		throw new Error(`Error in pagination: ${error.message}`);
	}
}

export default paginate;
