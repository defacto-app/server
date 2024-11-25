import type { Document, Model, SortOrder } from 'mongoose';

interface PaginationResult<T> {
	meta: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
	data: T[];
}

interface PopulateOptions {
	path: string;
	select?: string;
}

async function paginate<T extends Document>(
	model: Model<T>,
	page: number,
	perPage: number,
	query: object,
	projection?: object | null,
	sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | null | undefined,
	populate?: PopulateOptions | PopulateOptions[]
): Promise<PaginationResult<T>> {
	try {
		const total = await model.countDocuments(query);
		const totalPages = Math.ceil(total / perPage);

		// Create the base query
		let queryBuilder = model.find(query, projection) as any;

		// Apply pagination
		queryBuilder = queryBuilder
			.skip((page - 1) * perPage)
			.limit(perPage);

		// Apply sorting if provided
		if (sort) {
			queryBuilder = queryBuilder.sort(sort);
		}

		// Apply population if provided
		if (populate) {
			if (Array.isArray(populate)) {
				for (const option of populate) {
					queryBuilder = queryBuilder.populate(option);
				}
			} else {
				queryBuilder = queryBuilder.populate(populate);
			}
		}

		// Execute the query
		const data = await queryBuilder.exec();

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

export { paginate, type PaginationResult, type PopulateOptions };