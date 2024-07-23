import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import paginate from "../utils/pagination";
import RestaurantModel from "./model";

const RestaurantController = {
	async all(req: Request, res: Response): Promise<void> {
		// Extract page and perPage from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 10;


		try {
			const paginationResult = await paginate(
				RestaurantModel,
				page,
				perPage,
				{},

			);

			SendResponse.success(res, "Restaurants retrieved", paginationResult);
			
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async one(req: Request, res: Response): Promise<void> {
		
		const data = res.locals.restaurantItem as any;

		try {
			SendResponse.success(res, "Restaurant retrieved", data);
			
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default RestaurantController;
