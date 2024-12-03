import type { Request, Response } from "express";

import SendResponse from "../../../libs/response-helper";
import MenuModel from "../../../menu/model";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../../../helper/cloudinary";
import { paginate } from "../../../utils/pagination";
import MenuService from "./service";
// Set up Cloudinary configuration

const AdminRestaurantMenuController = {
	async create(req: Request, res: Response): Promise<void> {
		const restaurant = res.locals.restaurantItem as any;
		const { name, category, price, available, image, menuType } = req.body;

		try {
			const newMenu = await MenuService.createMenu(
				{ name, category, price, available, image, menuType },
				restaurant.publicId,
			);

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

		try {
			const result = await MenuService.getAllMenus(
				restaurant.publicId,
				search,
				page,
				perPage,
				includeDeleted,
			);

			SendResponse.success(res, "Menu items retrieved", result);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
	async one(req: Request, res: Response): Promise<void> {
		const data = res.locals.menuItem as any;

		try {
			SendResponse.success(res, "Menu item retrieved", data);
		} catch (error: any) {
			console.log(error);
			SendResponse.serverError(res, error.message);
		}
	},
	//

	async update(req: Request, res: Response): Promise<void> {
		const menu = res.locals.menuItem as any;
		const { name, price, available, image, categoryId } = req.body;

		try {
			const updatedMenu = await MenuModel.findOneAndUpdate(
				{ publicId: menu.publicId },
				{ name, price, available, image, categoryId },
				{ new: true },
			);

			SendResponse.success(res, "Menu item updated", updatedMenu);
		} catch (error: any) {
			console.log(error);
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
			SendResponse.serverError(res, error.message);
		}
	},

	async allMenu(req: Request, res: Response): Promise<void> {
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
		const search: string = (req.query.search as string) || ""; // Get search term

		try {
			const result = await MenuService.getAllMenusWithPipeline(
				search,
				page,
				perPage,
			);
			SendResponse.success(res, "Menu items retrieved", result);
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

	async toggleAvailability(req: Request, res: Response) {
		const menu = res.locals.menuItem as any;

		try {
			const updatedMenu = await MenuModel.findOneAndUpdate(
				{ publicId: menu.publicId },
				{ available: !menu.available },
				{ new: true }, // Return the updated document
			) as any;

			if (!updatedMenu) {
				return SendResponse.notFound(
					res,
					"Menu not found for updating availability",
				);
			}

			console.log(updatedMenu, "updatedMenu");

			SendResponse.success(res, updatedMenu, "Menu availability updated");
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminRestaurantMenuController;
