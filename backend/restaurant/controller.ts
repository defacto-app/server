import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import paginate from "../utils/pagination";
import RestaurantModel from "./model";
import MenuModel from "../menu/model";
import CategoryModel from "../category/model";

const RestaurantController = {
	async all(req: Request, res: Response): Promise<void> {
		// Extract page, perPage, search, and category from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 9;
		const search: string = (req.query.search as string) || '';
		const category: string = (req.query.category as string) || '';

		try {
			// Construct the query object
			const query: any = {};

			// If search parameter is provided, add it to the query object
			if (search) {
				query.name = { $regex: search, $options: 'i' }; // 'i' for case-insensitive
			}

			// If category parameter is provided, add it to the query object
			if (category) {
				query.category = { $regex: category, $options: 'i' }; // Case-insensitive match for category
			}

			const paginationResult = await paginate(RestaurantModel, page, perPage, query);

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

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},


	async categories(req: Request, res: Response): Promise<void> {
		try {
			// Extract search query from request query params
			const search = req.query.search as string || '';

			// Build the query object to filter active categories
			const query: any = { active: true };

			// If search is provided, add a regex filter to search in the 'name' field
			if (search) {
				query.name = { $regex: search, $options: 'i' }; // 'i' for case-insensitive
			}

			// Find categories with the query (filtered by search and active status)
			const categories = await CategoryModel.find(query, 'slug name description');

			SendResponse.success(res, "Categories retrieved", categories);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}




};

export default RestaurantController;
