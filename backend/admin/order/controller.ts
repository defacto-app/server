import type { Request, Response } from "express";
import type { SortOrder } from "mongoose";

import SendResponse from "../../libs/response-helper";
import { CreateOrderSchema } from "./validation";
import OrderModel from "./model";

const AdminOrderController = {
	async all(req: Request, res: Response): Promise<void> {
		console.log(req.query, "Query params");
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
		const search: string = (req.query.search as string) || "";
		const type: string = (req.query.type as string) || ""; // Type of order, either "food" or "package"

		try {
			const searchQuery: any = {
				...(search && {
					$or: [
						{ firstName: { $regex: search, $options: "i" } },
						{ email: { $regex: search, $options: "i" } },
						{ phoneNumber: { $regex: search, $options: "i" } },
					],
				}),
				...(type && { type }), // Add type filter if provided
			};

			const sort: { [key: string]: SortOrder } = { createdAt: -1 };

			const aggregationPipeline = [
				{ $match: searchQuery },
				{ $sort: sort },
				{ $skip: (page - 1) * perPage },
				{ $limit: perPage },
				{
					$project: {
						_id: 1,
						createdAt: 1,
						updatedAt: 1,
						type: 1,
						charge: 1,
						status: 1,
						pickupTime: 1,
						assignedTo: 1,
						description: 1,
						cashPaymentLocation: 1,
						publicId: 1,
						orderId: 1,
						"dropOffDetails.name": 1,
					},
				},
			] as any;

			const data = await OrderModel.aggregate(aggregationPipeline);
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

			SendResponse.success(res, "Orders retrieved", paginationResult);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async create(req: Request, res: Response): Promise<void> {
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

		async one(req: Request, res: Response): Promise<void> {
		const order = res.locals.orderItem as any;

		try {
			/*const order = res.locals.orderItem as any;
			const order = await OrderModel.findById(order);*/
			SendResponse.success(res, "Order retrieved", order);
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},
};

export default AdminOrderController;
