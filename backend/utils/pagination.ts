// utils/pagination.ts
import type { Model, Document ,SortOrder} from "mongoose";

interface PaginationResult<T> {
	data: T[];
	meta: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
}

async function paginate<T extends Document>(
	model: Model<T>,
	page: number,
	perPage: number,
	query: object,
	projection?: object,
	sort?: string | { [key: string]: SortOrder | { $meta: any; }; } | [string, SortOrder][] | null | undefined, // Update sort parameter type
): Promise<PaginationResult<T>> {
	try {
		const total = await model.countDocuments(query);
		const totalPages = Math.ceil(total / perPage);
		const data = await model
			.find(query, projection)
			.skip((page - 1) * perPage)
			.limit(perPage)
			.sort(sort); // Apply sorting

		return {
			meta: {
				page,
				perPage,
				total,
				totalPages,
			},
			data,
		};
	} catch (error: any) {
		throw new Error(`Error in pagination: ${error.message}`);
	}
}

export default paginate;
