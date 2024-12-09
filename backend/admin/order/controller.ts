import type { Request, Response } from "express";

import SendResponse from "../../libs/response-helper";
import { CreateOrderSchema } from "./validation";
import OrderModel from "./model";
import { OrderService } from "./service";

const AdminOrderController = {
	async all(req: Request, res: Response): Promise<void> {
		try {
			const page = Number.parseInt(req.query.page as string) || 1;
			const perPage = Number.parseInt(req.query.perPage as string) || 20;
			const search = (req.query.search as string) || "";
			const type = (req.query.type as string) || "";

			const options = { page, perPage, search, type };

			const result = await OrderService.all(options);

			SendResponse.success(res, "Orders retrieved", result);
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

			SendResponse.created(res, "Order created successfully", newOrder);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async restaurant(req: Request, res: Response): Promise<void> {
		const order = res.locals.orderItem as any;

		const restaurant = res.locals.restaurant as any; // Retrieve the restaurant data added in the middleware
		const driver = res.locals.driver;
		try {


			const response = {
				order,
				...(restaurant && { restaurant }),  // Include restaurant only if it exists
				...(driver && { driver })  // Include driver only if it exists
			};

			SendResponse.success(res, "Order retrieved", response);
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},
	async one(req: Request, res: Response): Promise<void> {
		const order = res.locals.orderItem as any;

		try {
			SendResponse.success(res, "Order retrieved", order);
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},

	async assignDriver(req: Request, res: Response): Promise<void> {
		try {
			const order = res.locals.orderItem;

			const body = req.body;

			// update order with driver details

			order.assignedTo = body.driverId;

			await order.save();

			SendResponse.success(res, "Order assigned to a driver", order);
		} catch (error: any) {
			SendResponse.badRequest(res, "", error);
		}
	},
	async updateStatus(req: Request, res: Response): Promise<void> {
		try {
			const order = res.locals.orderItem;
			const newStatus = req.body.status;
			const currentStatus = order.status;

			// Define valid transitions
			const validTransitions: Record<string, string[]> = {
				pending: ["in-progress", "completed", "cancelled"],
				"in-progress": ["completed", "cancelled"],
				completed: [], // No further transitions allowed
				cancelled: [], // No further transitions allowed
			};

			// Get allowed transitions for current status
			const allowedTransitions = validTransitions[currentStatus] || [];

			// Validate the transition
			if (!allowedTransitions.includes(newStatus)) {
				SendResponse.badRequest(
					res,
					`Cannot change order status from ${currentStatus} to ${newStatus}`,
				);
			}

			// If validation passes, update the order
			order.status = newStatus;
			if (newStatus === "completed") {
				order.deliveredAt = new Date();
			}

			// await order.save();
			SendResponse.success(res, `Order status updated to ${newStatus}`, order);
		} catch (error) {
			SendResponse.serverError(res, error);
		}
	},
};

export default AdminOrderController;
