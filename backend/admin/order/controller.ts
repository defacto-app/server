import type { Request, Response } from "express";
import type { SortOrder } from "mongoose";

import SendResponse from "../../libs/response-helper";
import { CreateOrderSchema } from "./validation";
import OrderModel from "./model";

const AdminOrderController = {
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

			// Define the sort order
			const sort: { [key: string]: SortOrder } = { firstName: 1 }; // Sort by firstName in ascending order

			// Use aggregation for pagination and sorting
			const aggregationPipeline = [
				{ $match: searchQuery }, // Match search query
				{ $sort: sort }, // Sort results by firstName
				{ $skip: (page - 1) * perPage }, // Pagination: skip documents
				{ $limit: perPage }, // Pagination: limit documents
			] as any;

			const data = await OrderModel.aggregate(aggregationPipeline);

			// Calculate the total number of users (for pagination)
			const total = await OrderModel.countDocuments(searchQuery);

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

	async create(req: Request, res: Response): Promise<void> {
		console.log("i go t here")
		try {
			// Validate the request body using the Zod schema
			const result = CreateOrderSchema.safeParse(req.body);

			// If validation fails
			if (!result.success) {
				const errorMessages = result.error.errors.map((err) => err.message);
				res
					.status(400)
					.json({ message: "Validation error", errors: errorMessages });
				return;

			}

			// Destructure validated data
			const {
				type,
				dropOffDetails,
				pickupDetails,
				charge,
				pickupTime,
				assignedTo,
				isInstant,
				deliveryMode,
				description,
				cashPaymentLocation,
				cashAvailable,
				menuItems,
				packageContent,
			} = result.data;

			// Create a new order object
			const newOrder = new OrderModel({
				type,
				dropOffDetails,
				pickupDetails,
				charge,
				pickupTime,
				assignedTo,
				isInstant,
				deliveryMode,
				description,
				cashPaymentLocation,
				cashAvailable,
				packageContent,
				menuItems,
			});

			// Save to database
			await newOrder.save();

			res
				.status(201)
				.json({ message: "Order created successfully", order: newOrder });
		} catch (error) {
			res.status(500).json({ message: "Server error", error });
		}
	},
};

export default AdminOrderController;
