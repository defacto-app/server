import type { NextFunction, Request, Response } from "express";

import SendResponse from "../libs/response-helper";
import OrderModel from "../admin/order/model";

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
					`Sorry, order ${orderId} is deleted or doesn't exist`
				);
			}

			res.locals.orderItem = order;
			next();
		} catch (error: any) {
			return SendResponse.serverError(res, error.message);
		}
	}
}

export default new OrderMiddleware();
