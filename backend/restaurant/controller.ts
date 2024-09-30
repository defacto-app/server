import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import paginate from "../utils/pagination";
import RestaurantModel from "./model";
import MenuModel from "../menu/model";

const RestaurantController = {
	async all(req: Request, res: Response): Promise<void> {
		// Extract page, perPage, and search from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 9;
		const search: string = (req.query.search as string) || '';

		try {
			// Construct the query object
			const query: any = {};

			// If search parameter is provided, add it to the query object
			if (search) {
				// Assuming you want to search in the 'name' field of the restaurant
				query.name = { $regex: search, $options: 'i' }; // 'i' for case-insensitive
			}

			const paginationResult = await paginate(
				RestaurantModel,
				page,
				perPage,
				query,
			);

			SendResponse.success(res, "Restaurants retrieved", paginationResult);

		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},


	async one(req: Request, res: Response): Promise<void> {

		const data = res.locals.restaurantItem as any;
		const searchQuery = req.query.search as string; // Get search query from request query

		try {
			// Create a search condition to check if a search query exists
			const searchCondition = searchQuery
				? { parent: data.publicId, name: { $regex: searchQuery, $options: 'i' } } // Case-insensitive search by name
				: { parent: data.publicId }; // If no search query, fetch all items

			// Fetch menu items for the restaurant based on search
			const menuItems = await MenuModel.find(searchCondition);

			// Return both the restaurant data and the filtered menu items
			SendResponse.success(res, "Restaurant and menu retrieved", { restaurant: data, menu: menuItems });

		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}



};

export default RestaurantController;
