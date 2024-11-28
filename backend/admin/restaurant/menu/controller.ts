import type { Request, Response } from "express";

import SendResponse from "../../../libs/response-helper";
import MenuModel from "../../../menu/model";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../../../helper/cloudinary";
import { paginate } from "../../../utils/pagination";
// Set up Cloudinary configuration

const AdminRestaurantMenuController = {
	async create(req: Request, res: Response): Promise<void> {
		const restaurant = res.locals.restaurantItem as any;
		const { name, category, price, available, image, menuType } = req.body;

		console.log(req.body, "create menu !!");
		try {
			// Create a new menu instance
			const newMenu = new MenuModel({
				name,
				category,
				price,
				available,
				image,
				menuType,
				parent: restaurant.publicId,
			});

			// Save the new menu item to the database
			await newMenu.save();

			// Return success response
			SendResponse.success(res, "Menu item created successfully", newMenu);
		} catch (error: any) {
			SendResponse.badRequest(res, error.message);
		}
	},

	async all(req: Request, res: Response): Promise<void> {
		const restaurant = res.locals.restaurantItem as any;
		const search: string = (req.query.search as string) || "";
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 10;
		const includeDeleted = req.query.includeDeleted === "true"; // Query parameter for filtering deleted items

		// Base query with parent filter
		const query: any = { parent: restaurant.publicId };

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

		try {
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
			const transformedData = {
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

			SendResponse.success(res, "Menu items retrieved", transformedData);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
	async one(req: Request, res: Response): Promise<void> {
		const data = res.locals.menuItem as any;

		try {
			SendResponse.success(res, "Menu item retrieved", data);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
	//

	async update(req: Request, res: Response): Promise<void> {
		const menu = res.locals.menuItem as any;
		const { name, category, price, available, image } = req.body;

		try {
			menu.name = name;
			menu.category = category;
			menu.price = price;
			menu.available = available;
			menu.image = image;

			await menu.save();

			SendResponse.success(res, "Menu item updated", menu);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async upload(req: Request, res: Response): Promise<void> {
		const menu = res.locals.menuItem as any;

		try {
			if (!req.file) {
				SendResponse.badRequest(res, "No image file uploaded");
				return;
			}

			// Upload the file to Cloudinary
			const result = await uploadToCloudinary(req.file.path, "defacto/menu");

			// Remove file from server after upload
			fs.unlinkSync(req.file.path);

			// Generate an optimized URL
			const optimizedUrl = cloudinary.url(result.public_id, {
				transformation: [
					{ width: 800, crop: "scale" },
					{ fetch_format: "auto", quality: "auto" },
				],
			});

			menu.image = optimizedUrl;

			await menu.save();

			SendResponse.success(
				res,
				"Menu image uploaded successfully",
				optimizedUrl,
			);
		} catch (error: any) {
			console.error(error);
			SendResponse.serverError(res, error.message);
		}
	},

	async allMenu(req: Request, res: Response): Promise<void> {
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
		const search: string = (req.query.search as string) || ""; // Get search term

		try {
			// Search by both name and category (case-insensitive)
			const searchQuery = search
				? {
						$or: [
							{ name: { $regex: search, $options: "i" } }, // Search by name
							{ "category.name": { $regex: search, $options: "i" } }, // Search by category name
						],
					}
				: {}; // If no search term, return all menu items

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
				{ $match: searchQuery }, // Apply search filter here
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

			const menuItems = await MenuModel.aggregate(pipeline);
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

			const paginationResult = {
				data: menuItems,
				meta: {
					page,
					perPage,
					totalPages: Math.ceil(totalItemsCount / perPage),
					totalItems: totalItemsCount,
				},
			};

			SendResponse.success(res, "Menu items retrieved", paginationResult);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async delete(req: Request, res: Response): Promise<void> {
		const menu = res.locals.menuItem as any;

		try {
			// Use the softDelete method on the model
			const updatedMenu = await MenuModel.softDelete(menu.publicId);

			if (!updatedMenu) {
				SendResponse.notFound(res, "Menu item not found or already deleted");
				return;
			}

			SendResponse.success(
				res,
				"Menu item soft deleted successfully",
				updatedMenu,
			);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async restore(req: Request, res: Response): Promise<void> {
		const menu = res.locals.menuItem as any;

		try {
			const restoredMenu = await MenuModel.restore(menu.publicId);

			if (!restoredMenu) {
				SendResponse.notFound(res, "Menu item not found or already active");
				return;
			}

			SendResponse.success(
				res,
				"Menu item restored successfully",
				restoredMenu,
			);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async getDeleted(req: Request, res: Response): Promise<void> {
		const restaurant = res.locals.restaurantItem as any;
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 10;

		try {
			const query = { parent: restaurant.publicId };

			const paginationResult = await paginate(
				MenuModel,
				page,
				perPage,
				{ ...query, isDeleted: true }, // Only fetch soft-deleted items
				undefined, // projection
				{ deletedAt: -1 }, // sort
			);

			SendResponse.success(
				res,
				"Soft-deleted menu items retrieved",
				paginationResult,
			);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async bulkDelete(req: Request, res: Response): Promise<void> {
		const { ids } = req.body; // Expect an array of menu `publicId`s

		if (!Array.isArray(ids) || ids.length === 0) {
			SendResponse.badRequest(res, "No menu item IDs provided");
			return;
		}

		try {
			const updatedMenus = await MenuModel.updateMany(
				{ publicId: { $in: ids } },
				{
					isDeleted: true,
					deletedAt: new Date(),
					available: false,
				},
			);

			SendResponse.success(
				res,
				`${updatedMenus.modifiedCount} menu items soft deleted`,
			);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async bulkRestore(req: Request, res: Response): Promise<void> {
		const { ids } = req.body; // Expect an array of menu `publicId`s

		if (!Array.isArray(ids) || ids.length === 0) {
			SendResponse.badRequest(res, "No menu item IDs provided");
			return;
		}

		try {
			const updatedMenus = await MenuModel.updateMany(
				{ publicId: { $in: ids } },
				{
					isDeleted: false,
					deletedAt: null,
					available: true,
				},
			);

			SendResponse.success(
				res,
				`${updatedMenus.modifiedCount} menu items restored`,
			);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async toggleAvailability(req: Request, res: Response): Promise<void> {
		const menu = res.locals.menuItem as any;

		try {
			menu.available = !menu.available;
			await menu.save();

			SendResponse.success(
				res,
				`Menu item is now ${menu.available ? "available" : "unavailable"}`,
				menu,
			);
		} catch (error: any) {
			console.log(error);
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminRestaurantMenuController;
