import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";
import RestaurantModel from "../../restaurant/model";
import type { SortOrder } from "mongoose";

import UserModel from "../../user/model";
// Set up Cloudinary configuration

const AdminUserController = {
	async all(req: Request, res: Response): Promise<void> {
		// Extract page, perPage, and search term from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
		const search: string = (req.query.search as string) || ""; // Get search term

		try {
			// Create a search query to match firstName, email, or phoneNumber (case-insensitive)
			const searchQuery = search
				? {
					$or: [
						{ firstName: { $regex: search, $options: "i" } },
						{ email: { $regex: search, $options: "i" } },
						{ phoneNumber: { $regex: search, $options: "i" } }
					]
				}
				: {}; // If no search term, return all users

			// Define the sort order
			const sort: { [key: string]: SortOrder } = { firstName: 1 }; // Sort by firstName in ascending order

			// Use aggregation for pagination and sorting
			const aggregationPipeline = [
				{ $match: searchQuery }, // Match search query
				{ $sort: sort }, // Sort results by firstName
				{ $skip: (page - 1) * perPage }, // Pagination: skip documents
				{ $limit: perPage }, // Pagination: limit documents
			] as any;

			const data = await UserModel.aggregate(aggregationPipeline);

			// Calculate the total number of users (for pagination)
			const total = await UserModel.countDocuments(searchQuery);

			const paginationResult = {
				data,
				meta: {
					totalPages: Math.ceil(total / perPage),
					page,
					perPage,
					total,
				},
			};

			SendResponse.success(res, "Users retrieved", paginationResult);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}

};

export default AdminUserController;
