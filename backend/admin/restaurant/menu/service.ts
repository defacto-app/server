import MenuModel from "../../../menu/model";
import { paginate } from "../../../utils/pagination";

class MenuService {
	static async createMenu(data: any, parentId: string) {
		const newMenu = new MenuModel({ ...data, parent: parentId });
		return await newMenu.save();
	}

	static async getAllMenus(
		parentId: string,
		search: string,
		page: number,
		perPage: number,
		includeDeleted: boolean,
	) {
		const query: any = { parent: parentId };

		// Add search criteria if search term exists
		if (search) {
			query.$or = [
				{ slug: { $regex: search, $options: "i" } },
				{ name: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
		}

		// Include or exclude soft-deleted items based on `includeDeleted` parameter
		if (!includeDeleted) {
			query.isDeleted = { $ne: true }; // Exclude deleted items if `includeDeleted` is not true
		}

		const paginationResult = await paginate(
			MenuModel,
			page,
			perPage,
			query,
			undefined, // projection
			{ createdAt: -1 }, // sort
			{ path: "categoryId", select: "name" }, // populate
		);

		// Transform the response to convert categoryId into category and remove the original categoryId
		return {
			meta: paginationResult.meta,
			data: paginationResult.data.map((item: { toObject: () => any }) => {
				const itemObj = item.toObject();
				const { categoryId, ...rest } = itemObj; // Destructure to separate categoryId from rest of the data

				return {
					...rest,
					category: {
						_id: categoryId?._id,
						name: categoryId?.name || "Unknown Category",
					},
				};
			}),
		};
	}

	static async getAllMenusWithPipeline(search: string, page: number, perPage: number) {
		// Search query
		const searchQuery = search
			? {
				$or: [
					{ name: { $regex: search, $options: "i" } },
					{ "category.name": { $regex: search, $options: "i" } },
				],
			}
			: {};

		// Aggregation pipeline
		const pipeline = [
			{
				$lookup: {
					from: "restaurants",
					localField: "parent",
					foreignField: "publicId",
					as: "restaurant",
				},
			},
			{
				$lookup: {
					from: "categories",
					localField: "categoryId",
					foreignField: "_id",
					as: "category",
				},
			},
			{ $unwind: "$restaurant" },
			{ $unwind: "$category" },
			{ $match: searchQuery }, // Apply search filter
			{
				$project: {
					name: 1,
					price: 1,
					available: 1,
					image: 1,
					createdAt: 1,
					updatedAt: 1,
					publicId: 1,
					"restaurant.name": 1,
					"restaurant.publicId": 1,
					"category.name": 1,
					"category._id": 1,
				},
			},
			{ $sort: { name: 1 } },
			{ $skip: (page - 1) * perPage },
			{ $limit: perPage },
		] as any;

		// Run the pipeline
		const menuItems = await MenuModel.aggregate(pipeline);

		// Count total items for pagination
		const totalItems = await MenuModel.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "categoryId",
					foreignField: "_id",
					as: "category",
				},
			},
			{ $unwind: "$category" },
			{ $match: searchQuery },
			{ $count: "count" },
		]);

		const totalItemsCount = totalItems[0]?.count || 0;

		// Return paginated result
		return {
			data: menuItems,
			meta: {
				page,
				perPage,
				totalPages: Math.ceil(totalItemsCount / perPage),
				totalItems: totalItemsCount,
			},
		};
	}


}

export default MenuService;

