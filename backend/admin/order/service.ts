import type { SortOrder } from "mongoose";
import OrderModel from "./model";

interface GetOrdersOptions {
	page: number;
	perPage: number;
	search: string;
	type: string;
}

export class OrderService {
	static async all(options: GetOrdersOptions) {
		const { page, perPage, search, type } = options;

		const searchQuery: any = {
			...(search && {
				$or: [
					{ firstName: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
					{ phoneNumber: { $regex: search, $options: "i" } },
					{
						orderId: {
							$regex: search,
							$options: "i",
						},
					},
				],
			}),
			...(type && { type }),
		};

		const sort: { [key: string]: SortOrder } = { createdAt: -1 };

		const aggregationPipeline = [
			{ $match: searchQuery },
			{ $sort: sort },
			{ $skip: (page - 1) * perPage },
			{ $limit: perPage },
			{
				$project: {
					_id: 1,
					createdAt: 1,
					updatedAt: 1,
					type: 1,
					charge: 1,
					status: 1,
					pickupTime: 1,
					assignedTo: 1,
					description: 1,
					cashPaymentLocation: 1,
					publicId: 1,
					orderId: 1,
					"dropOffDetails.name": 1,
					"dropOffDetails.phoneNumber": 1,
					"pickupDetails.name": 1,
				},
			},
		] as any;

		const data = await OrderModel.aggregate(aggregationPipeline);
		const total = await OrderModel.countDocuments(searchQuery);

		return {
			data,
			meta: {
				totalPages: Math.ceil(total / perPage),
				page,
				perPage,
				total,
			},
		};
	}
}
