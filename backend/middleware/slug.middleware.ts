import type { NextFunction, Request, Response } from "express";

import SendResponse from "../libs/response-helper";
import RestaurantModel from "../restaurant/model";
import MenuModel from "../menu/model";

class SlugMiddleware {


	public async restaurantSlug(req: Request, res: Response, next: NextFunction) {
		const restaurantSlug = req.params.slug;

		try {
			if (!restaurantSlug) {
				return res.status(400).json({ error: "restaurant name  is required" });
			}

			const rst = await RestaurantModel.findOne({
				slug: restaurantSlug,
			});

			if (!rst) {
				SendResponse.notFound(
					res,
					`Sorry, restaurant  ${restaurantSlug} is deleted or doesnt exist `,
				);
			}

			res.locals.restaurantItem = rst;

			next();
		
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}

	public async restaurantPublicId(req: Request, res: Response, next: NextFunction) {
		const publicId = req.params.publicId;

		console.log(publicId,"restaurantPublicId");
		try {
			if (!publicId) {
				return res.status(400).json({ error: "restaurant name  is required" });
			}

			const rst = await RestaurantModel.findOne({
				publicId: publicId,
			});

			if (!rst) {
				SendResponse.notFound(
					res,
					`Sorry, restaurant  ${publicId} is deleted or doesnt exist `,
				);
			}

			res.locals.restaurantItem = rst;

			next();

		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}

	public async menuPublicId(req: Request, res: Response, next: NextFunction) {
		const publicId = req.params.publicId;

		try {
			if (!publicId) {
				return res.status(400).json({ error: "restaurant name  is required" });
			}

			const menu = await MenuModel.findOne({
				publicId: publicId,
			});

			if (!menu) {
				SendResponse.notFound(
					res,
					`Sorry, restaurant  ${publicId} is deleted or doesnt exist `,
				);
			}

			res.locals.menuItem = menu;

			next();

		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}
}

export default new SlugMiddleware();
