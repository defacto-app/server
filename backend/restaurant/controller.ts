import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import RestaurantModel from "./model";
import MenuModel from "../menu/model";
import CategoryModel from "../category/model";
import OrderModel from "../admin/order/model";
import { paginate } from "../utils/pagination";

const RestaurantController = {
	async all(req: Request, res: Response): Promise<void> {
		// Extract page, perPage, search, and category from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 9;
		const search: string = (req.query.search as string) || "";
		const category: string = (req.query.category as string) || "";

		try {
			// Construct the query object
			const query: any = {};

			// If search parameter is provided, add it to the query object
			if (search) {
				query.name = { $regex: search, $options: "i" }; // 'i' for case-insensitive
			}

			// If category parameter is provided, add it to the query object
			if (category) {
				query.category = { $regex: category, $options: "i" }; // Case-insensitive match for category
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
		const searchQuery = req.query.search as string;
		const categoryId = req.query.categoryId as string;

		try {
			// Fetch active menu categories first
			const categories = await CategoryModel.find({
				categoryType: "menu",
				active: true,
			})
				.select("_id name slug")
				.sort("name");

			// Build search conditions
			const searchConditions: any = {
				parent: data.publicId,
			};

			// Add search query if provided
			if (searchQuery) {
				searchConditions.name = { $regex: searchQuery, $options: "i" };
			}

			// Add category filter if provided
			if (categoryId) {
				searchConditions.categoryId = categoryId;
			}

			// Fetch menu items with populated category
			const menuItems = await MenuModel.find(searchConditions)
				.populate("categoryId", "name slug")
				.sort({ name: 1 });

			// Filter menu items to only include those with a valid categoryId
			const validMenuItems = menuItems.filter((item: any) => item.categoryId);

			// Collect category IDs from valid menu items
			const categoryIdsWithItems = new Set(
				validMenuItems.map((item: any) => String(item.categoryId._id)),
			);

			// Filter categories to include only those with associated menu items
			const filteredCategories = categories.filter((category) =>
				categoryIdsWithItems.has(String(category._id)),
			);

			SendResponse.success(res, "Restaurant and menu retrieved", {
				restaurant: data,
				menu: validMenuItems, // Only include valid menu items
				categories: filteredCategories, // Only include categories with items
			});
		} catch (error: any) {
			console.error("Restaurant controller error:", error);
			SendResponse.serverError(res, error.message);
		}
	},

	async categories(req: Request, res: Response): Promise<void> {
		try {
			// Extract search query from request query params
			const search = (req.query.search as string) || "";

			// Build the query object to filter active categories
			const query: any = { active: true };

			// If search is provided, add a regex filter to search in the 'name' field
			if (search) {
				query.name = { $regex: search, $options: "i" }; // 'i' for case-insensitive
			}

			// Find categories with the query (filtered by search and active status)
			const categories = await CategoryModel.find(
				query,
				"slug name description",
			);

			SendResponse.success(res, "Categories retrieved", categories);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async order(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;
		try {
			// Step 1: Validate the request payload using the CreateOrderSchema
			const value = req.body;

			// Step 2: Extract data from validated request payload
			const {
				userId,
				dropOffDetails,
				pickupDetails,
				deliveryCharge,
				restaurantOrder,
				charge,
				description,
				cashPaymentLocation,
			} = value;

			console.log({ user, value });

			// Step 3: Create a new order document for a restaurant order
			const newOrder = new OrderModel({
				type: "food", // This is a restaurant order
				userId,
				dropOffDetails,
				pickupDetails,
				charge,
				status: "pending", // Initial status of the order
				description,
				cashPaymentLocation,
				deliveryCharge,
				isInstant: true,
				restaurantOrder: restaurantOrder.map((item: any) => ({
					name: item.name,
					quantity: item.quantity,
					price: item.price,
				})),
			});

			// Step 4: Save the order to the database
			await newOrder.save();

			// Step 5: Send success response with the created order
			SendResponse.created(res, "Order created successfully");
		} catch (error) {
			console.error("Error creating order:", error);
			// Step 6: Handle any server errors and send a 500 response
			SendResponse.serverError(res, "Error creating order");
		}
	},
};

export default RestaurantController;
