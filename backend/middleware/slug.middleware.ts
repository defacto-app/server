import type { NextFunction, Request, Response } from "express";

import PackageModel from "../model/package.model";
import SendResponse from "../libs/response-helper";
import RestaurantModel from "../restaurant/model";

class SlugMiddleware {
	public async packageId(req: Request, res: Response, next: NextFunction) {
		
		const user = res.locals.user as any;
		const packageId = req.params.packageId;

		try {
			if (!packageId) {
				return res.status(400).json({ error: "packageId  is required" });
			}

			// Execute the query
			const pkg = await PackageModel.findOne({
				publicId: packageId,
				userId: user.userId,
			});

			if (!pkg) {
				SendResponse.notFound(
					res,
					`Sorry, package  ${packageId} is deleted or doesnt exist `,
				);
			}

			res.locals.packageItem = pkg;

			next();
			
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}

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
}

export default new SlugMiddleware();
