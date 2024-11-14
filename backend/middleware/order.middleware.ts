import type { NextFunction, Request, Response } from "express";

import SendResponse from "../libs/response-helper";
import OrderModel from "../admin/order/model";

class OrderMiddleware {


	public async orderId(req: Request, res: Response, next: NextFunction) {
		const orderId = req.params.orderId;


		try {
			if (!orderId) {
				return res.status(400).json({ error: "restaurant name  is required" });
			}

			const order = await OrderModel.findOne({
				publicId: orderId,
			});

			console.log(order,"middleware --orderId");


			if (!order) {
				SendResponse.notFound(
					res,
					`Sorry, restaurant  ${orderId} is deleted or doesnt exist `,
				);
			}



			res.locals.orderItem = order;

			next();
		
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}

}

export default new OrderMiddleware();
