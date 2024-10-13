import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";
import type { SortOrder } from "mongoose";

import UserModel from "../../user/model";
import AuthModel from "../../auth/model";

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
							{ phoneNumber: { $regex: search, $options: "i" } },
						],
					}
				: {}; // If no search term, return all users

			// Define the sort order, now by lastSeenAt in descending order
			const sort: { [key: string]: SortOrder } = { lastSeenAt: -1 }; // Sort by lastSeenAt, descending (most recent first)

			// Use aggregation for pagination and sorting
			const aggregationPipeline = [
				{ $match: searchQuery }, // Match search query
				{ $sort: sort }, // Sort results by lastSeenAt
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
	},

	async delete(req: Request, res: Response): Promise<void> {
		const { userId } = req.params; // Get userId from request params

		try {
			// First, find the user by userId and delete it
			const user = await UserModel.findOneAndDelete({ userId });

			// If user does not exist, return a 404 error
			if (!user) {
				SendResponse.notFound(res, "User not found");
			}

			// Delete the associated record in AuthModel
			const authDeletion = await AuthModel.findOneAndDelete({
				publicId: user?.userId,
			});

			// If auth record does not exist, log a warning (optional)
			if (!authDeletion) {
				console.warn(`Auth record for userId: ${userId} was not found`);
			}

			// Return success message
			SendResponse.success(
				res,
				"User and authentication record deleted successfully",
			);
		} catch (error: any) {
			// Handle any errors
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminUserController;
