import type { Request, Response } from "express";

// Set up Cloudinary configuration

import SendResponse from "../../../libs/response-helper";
import MenuModel from "../../../menu/model";
import CategoryModel from "./model";
import CategoryService from "./service";

const AdminCategoryController = {
	async create(req: Request, res: Response): Promise<void> {
		try {
			SendResponse.success(res, "Category created successfully");
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async all(req: Request, res: Response): Promise<void> {
		try {
			const search = (req.query.search as string) || "";
			const page = Number.parseInt(req.query.page as string) || 1;
			const perPage = Number.parseInt(req.query.perPage as string) || 10;

			const result = await CategoryService.getAllCategories(
				search,
				page,
				perPage,
			);

			SendResponse.success(res, "Categories retrieved", result);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async search(req: Request, res: Response): Promise<void> {
		console.log("Search route triggered. Query:", req.query);

		try {
			const search = (req.query.search as string) || "";
			const results = await CategoryService.searchCategories(search);

			SendResponse.success(res, "Search suggestions retrieved", results);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async update(req: Request, res: Response): Promise<void> {
		try {
			const category = res.locals.categoryItem as any;

			const body = req.body;

			// Update the category

			const updatedCategory = await CategoryModel.findOneAndUpdate(
				{ publicId: category.publicId },
				{ ...body },
				{ new: true },
			);

			SendResponse.success(
				res,
				"Category updated successfully",
				updatedCategory,
			);

			// const updatedCategory = await category.save();
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
	async delete(req: Request, res: Response): Promise<void> {
		try {
			const category = res.locals.categoryItem as any;

			// Check for existing menus or relationships
			const associatedMenus = await MenuModel.countDocuments({
				categoryId: category._id,
			});

			if (associatedMenus > 0) {
				SendResponse.badRequest(
					res,
					"Cannot delete category. It has associated menu items.",
				);
			}
			console.log(associatedMenus, "associatedMenus");
			// If no associations, delete the category
			await category.deleteOne();

			SendResponse.success(res, "Category deleted successfully");
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminCategoryController;
