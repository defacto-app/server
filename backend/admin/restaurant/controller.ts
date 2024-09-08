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

	async update(req: Request, res: Response): Promise<void> {
		const restaurant = res.locals.restaurantItem as any;
		const { name } = req.body;

		try {
			restaurant.name = name;

			await restaurant.save();

			SendResponse.success(res, "Restaurant updated", restaurant);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async create(req: Request, res: Response): Promise<void> {
		const { name,  category, address, phone, email, openingHours } =
			req.body;

		try {
			// Create a new restaurant instance
			const newRestaurant = new RestaurantModel({
				name,
				category,
				address,
				phone,
				email,
				openingHours,
			});

			// Save the new restaurant to the database
			await newRestaurant.save();

			// Return success response
			SendResponse.success(
				res,
				"Restaurant created successfully",
				newRestaurant,
			);
		} catch (error: any) {
			SendResponse.badRequest(res, error.message);
		}
	},
	async delete(req: Request, res: Response): Promise<void> {
		try {
			// The restaurant is already loaded in res.locals by middleware
			const restaurant = res.locals.restaurantItem as any;

			if (!restaurant) {
				// If no restaurant is found, return a 404 error
				SendResponse.notFound(res, "Restaurant not found");
			}

			// Use deleteOne() to remove the document
			await restaurant.deleteOne();

			// Return success response
			SendResponse.success(res, "Restaurant deleted successfully");
		} catch (error: any) {
			// Return server error response in case of any exceptions
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminRestaurantController;
