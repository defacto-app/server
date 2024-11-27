import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";

import { OrderValidator } from "./validator";
import type { UserDataType } from "../user/model";
import OrderService from "./service";

const OrderController = {
	async all(req: Request, res: Response): Promise<void> {
		try {
			console.log(req.query, "Query params");

			const { orderId, sort, page = 1, perPage = 10, type } = req.query as any;

			// Call the service function to get the orders
			const result = await OrderService.getOrders({
				orderId,
				sort,
				page: Number.parseInt(page as string, 10),
				perPage: Number.parseInt(perPage as string, 10),
				type,
			});

			SendResponse.success(res, "Orders retrieved", result);
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},

	async restaurant(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;

		try {
			// Extract data from the request body
			const orderData = req.body;

			// Call the service to create the restaurant order
			await OrderService.createRestaurantOrder(orderData, user);

			// Send success response
			SendResponse.created(res, "Order created successfully");
		} catch (error) {
			console.error("Error creating order:", error);
			SendResponse.serverError(res, "Error creating order");
		}
	},

	async package_delivery(req: Request, res: Response): Promise<void> {
		try {
			const user = res.locals.user as UserDataType;

			// Validate the request body
			const validation = await OrderValidator.validateDelivery(req.body);

			if (!validation.success) {
				SendResponse.badRequest(res, "Validation failed", validation.errors);
				return; // Early return after validation failure
			}

			const validatedData = validation.data as any;

			// Call the service to handle the package delivery logic
			const result = await OrderService.createPackageDelivery(
				validatedData,
				user,
			);

			// Send success response
			SendResponse.success(res, "Created New Package Delivery.", {
				orderId: result.orderId,
			});
		} catch (error: any) {
			console.error(error);
			SendResponse.serverError(res, error.message);
		}
	},
};

export default OrderController;
