import type { Request, Response } from "express";
import paginate from "../../utils/pagination";
import SendResponse from "../../libs/response-helper";
import RestaurantModel from "../../restaurant/model";
import type { SortOrder } from "mongoose";

const AdminRestaurantController = {
	async all(req: Request, res: Response): Promise<void> {
		// Extract page, perPage, and search term from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
		const search: string = (req.query.search as string) || ""; // Get search term

		try {
			// Create a search query using regex to match the search term (case-insensitive)
			const searchQuery = search
				? { name: { $regex: search, $options: "i" } } // Search by restaurant name (case-insensitive)
				: {}; // If no search term, return all restaurants

			// Define the sort order
			const sort: { [key: string]: SortOrder } = { name: 1 }; // Sort by name in ascending order

			// Use the searchQuery in the pagination
			const paginationResult = await paginate(
				RestaurantModel,
				page,
				perPage,
				searchQuery,
				undefined,
				sort, // Pass the sort parameter
			);

			SendResponse.success(res, "Restaurants retrieved", paginationResult);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async one(req: Request, res: Response): Promise<void> {
		const data = res.locals.restaurantItem as any;

		try {
			SendResponse.success(res, "Restaurant retrieved", data);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminRestaurantController;
