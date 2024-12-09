import type { NextFunction, Request, Response } from "express";

import SendResponse from "../libs/response-helper";
import OrderModel from "../admin/order/model";
import RestaurantModel from "../restaurant/model";
import UserModel from "../user/model";

class OrderMiddleware {
	public async orderId(req: Request, res: Response, next: NextFunction) {
		const orderId = req.params.orderId;

		try {
			if (!orderId) {
				return res.status(400).json({ error: "Order ID is required" });
			}

			const order = await OrderModel.findOne({
				publicId: orderId,
			});

			if (!order) {
				// Without 'return', the function continues executing
				return SendResponse.notFound(
					res,
					`Sorry, order ${orderId} is deleted or doesn't exist`,
				);
			}

			// Check if restaurantId is present in the order
			if (order.restaurantId) {
				const restaurant = await RestaurantModel.findOne({
					publicId: order.restaurantId,
				});

				if (restaurant) {
					// Add restaurant details to the order object
					res.locals.restaurant = restaurant;
				}
			}

			res.locals.orderItem = order;
			next();
		} catch (error: any) {
			return SendResponse.serverError(res, error.message);
		}
	}

	public async getRestaurantDetails(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		const order = res.locals.orderItem;

		try {
			if (order.restaurantId) {
				const restaurant = await RestaurantModel.findOne({
					publicId: order.restaurantId,
				});

				if (restaurant) {
					res.locals.restaurant = restaurant;
				}
			}
			next();
		} catch (error: any) {
			return SendResponse.serverError(res, error.message);
		}
	}

	// Fetches assigned driver
	public async getDriverDetails(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		const order = res.locals.orderItem;

		try {
			if (order.assignedTo) {
				const driver = await UserModel.findOne({
					publicId: order.assignedTo,
					role: "driver",
				});

				if (driver) {
					res.locals.driver = driver;
				}
			}
			next();
		} catch (error: any) {
			return SendResponse.serverError(res, error.message);
		}
	}
}

export default new OrderMiddleware();
