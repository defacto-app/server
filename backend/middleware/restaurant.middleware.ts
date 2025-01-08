import type { NextFunction, Request, Response } from "express";

import SendResponse from "../libs/response-helper";
import RestaurantModel from "../restaurant/model";
import MenuModel from "../menu/model";
import CategoryModel from "../admin/restaurant/category/model";

class RestaurantMiddleware {
	public async restaurantSlug(req: Request, res: Response, next: NextFunction) {
		const restaurantSlug = req.params.slug;

		try {
			if (!restaurantSlug) {
				SendResponse.notFound(
					res,
					`Sorry, restaurant  ${restaurantSlug} is deleted or doesnt exist `,
				);
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

	public async restaurantPublicId(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
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

	public async menuPublicId(req: Request, res: Response, next: NextFunction) {
		const menuId = req.params.menuId;

		try {
			if (!menuId) {
				return SendResponse.badRequest(res, "Menu public ID is required");
			}

			const result = await MenuModel.aggregate([
				{
					$match: {
						publicId: menuId,
					},
				},
				{
					$lookup: {
						from: "categories",
						localField: "categoryId",
						foreignField: "publicId",
						as: "categoryData",
					},
				},
				{
					$unwind: {
						path: "$categoryData",
						preserveNullAndEmptyArrays: true  // Keep menu even if category not found
					}
				},
				{
					$project: {
						_id: 1,
						publicId: 1,
						parent: 1,
						slug: 1,
						name: 1,
						image: 1,
						available: 1,
						price: 1,
						createdAt: 1,
						updatedAt: 1,
						description: 1,
						categoryId: 1,
						category: {
							name: "$categoryData.name",
							slug: "$categoryData.slug",
							publicId: "$categoryData.publicId",
						},
					},
				},
			]);

			if (!result.length) {
				return SendResponse.notFound(
					res,
					`Sorry, Menu ${menuId} is deleted or doesn't exist`,
				);
			}

			res.locals.menuItem = result[0]
			next();
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}
	public async categoryPublicId(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		const publicId = req.params.categoryId; // Correct parameter name

		console.log(publicId, "category id");
		try {
			if (!publicId) {
				return SendResponse.badRequest(res, "Category public ID is required");
			}

			// Use CategoryModel instead of MenuModel
			const category = await CategoryModel.findOne({
				publicId: publicId,
			});

			if (!category) {
				return SendResponse.notFound(
					res,
					`Category with public ID ${publicId} does not exist.`,
				);
			}

			res.locals.categoryItem = category;

			next();
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}
}

export default new RestaurantMiddleware();
