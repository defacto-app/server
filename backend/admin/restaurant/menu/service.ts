import MenuModel from "../../../menu/model";

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

		if (search) {
			query.$or = [
				{ slug: { $regex: search, $options: "i" } },
				{ name: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
		}

		if (!includeDeleted) {
			query.isDeleted = { $ne: true };
		}

		const skip = (page - 1) * perPage;

		const aggregation = [
			{ $match: query },
			{
				$lookup: {
					from: "categories",
					localField: "categoryId",
					foreignField: "publicId",
					as: "category",
				},
			},
			{ $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
			{
				$project: {
					_id: 1,
					name: 1,
					slug: 1,
					image: 1,
					price: 1,
					available: 1,
					parent: 1,
					publicId: 1,
					createdAt: 1,
					updatedAt: 1,
					isDeleted: 1,
					deletedAt: 1,
					category: {
						id: "$category.publicId",
						name: { $ifNull: ["$category.name", "Unknown Category"] },
					},
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $skip: skip },
			{ $limit: perPage },
		] as any;

		// First get total count using aggregation to ensure we count after the match
		const countAggregation = [{ $match: query }, { $count: "total" }];

		const [results, countResult] = await Promise.all([
			MenuModel.aggregate(aggregation),
			MenuModel.aggregate(countAggregation),
		]);

		const total = countResult[0]?.total || 0;
		const totalPages = Math.ceil(total / perPage);

		return {
			data: results,
			meta: {
				page,
				perPage,
				totalPages,
				totalItems: total,
			},
		};
	}

	static async getAllMenusWithPipeline(
		search: string,
		page: number,
		perPage: number,
 ) {
		// Search query
		const searchQuery = search
			 ? {
						 $or: [
								{ name: { $regex: search, $options: "i" } },
								{ "category.name": { $regex: search, $options: "i" } },
						 ],
					}
			 : {};

		const lookupStage = {
			 $lookup: {
					from: "categories",
					localField: "categoryId",
					foreignField: "publicId", // Main pipeline uses publicId
					as: "category",
			 },
		};

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
			 lookupStage, // Use consistent lookup
			 { $unwind: "$restaurant" },
			 { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }, // Handle missing categories
			 { $match: { ...searchQuery, isDeleted: { $ne: true } } }, // Exclude deleted items
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
						 "category.publicId": 1,
					},
			 },
			 { $sort: { createdAt: -1 } },
			 { $skip: (page - 1) * perPage },
			 { $limit: perPage },
		] as any;

		// Count pipeline should match main pipeline exactly (before pagination)
		const countPipeline = [
			 {
					$lookup: {
						 from: "restaurants",
						 localField: "parent",
						 foreignField: "publicId",
						 as: "restaurant",
					},
			 },
			 lookupStage, // Use the same lookup
			 { $unwind: "$restaurant" },
			 { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
			 { $match: { ...searchQuery, isDeleted: { $ne: true } } }, // Exclude deleted items
			 { $count: "count" },
		];

		// Run both pipelines concurrently
		const [menuItems, totalItems] = await Promise.all([
			 MenuModel.aggregate(pipeline),
			 MenuModel.aggregate(countPipeline),
		]);

		const totalItemsCount = totalItems[0]?.count || 0;

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
