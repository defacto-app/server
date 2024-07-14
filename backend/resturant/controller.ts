import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";

const RestaurantController = {
	async all(req: Request, res: Response): Promise<void> {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		// const user = res.locals.user as any;

		const data = [
			{
				name: "Italiano Delight",
				rating: 4.7,
				delivery_time: "10-25 mins",
				category: "Pasta",
				image: "https://example.com/images/italiano_delight.jpg",
			},
			{
				name: "Sushi Paradise",
				rating: 4.8,
				delivery_time: "15-30 mins",
				category: "Sushi",
				image: "https://example.com/images/sushi_paradise.jpg",
			},
			{
				name: "Taco Fiesta",
				rating: 4.6,
				delivery_time: "5-15 mins",
				category: "Mexican",
				image: "https://example.com/images/taco_fiesta.jpg",
			},
			{
				name: "Curry Corner",
				rating: 4.7,
				delivery_time: "20-35 mins",
				category: "Indian",
				image: "https://example.com/images/curry_corner.jpg",
			},
			{
				name: "Burger Bliss",
				rating: 4.5,
				delivery_time: "5-20 mins",
				category: "Burgers",
				image: "https://example.com/images/burger_bliss.jpg",
			},
			{
				name: "Salad Stop",
				rating: 4.4,
				delivery_time: "10-20 mins",
				category: "Salad",
				image: "https://example.com/images/salad_stop.jpg",
			},
		];

		try {
			SendResponse.success(res, "Restarants  retrieved !!!", data);
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default RestaurantController;
