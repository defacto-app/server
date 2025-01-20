import type { Request, Response } from "express";

// Set up Cloudinary configuration

import SendResponse from "../../../libs/response-helper";
import MenuModel from "../../../menu/model";
import CategoryModel from "./model";
import CategoryService from "./service";
import { categoryValidator } from "./validator";

const AdminCategoryController = {
   async create(req: Request, res: Response): Promise<Response> {
      // Validate the request body using safeParse
      const validationResult = categoryValidator.safeParse(req.body);

      console.log("Validation result:", validationResult);

      if (!validationResult.success) {
         // Format validation errors
         const formattedErrors: any = {};
         for (const error of validationResult.error.errors) {
            const path = error.path.join(".");
            formattedErrors[path] = error.message;
         }

         console.log("Validation errors:", formattedErrors);

         return SendResponse.badRequest(res, formattedErrors);
      }

      try {
         const validatedData = validationResult.data;

         // Check for duplicate categories
         const existingCategory = await CategoryModel.findOne({
            name: validatedData.name,
            categoryType: validatedData.categoryType,
         });

         if (existingCategory) {
            const message:any = {
               name: "Category already exists",
            }
            return SendResponse.badRequest(res, message);
         }

         // Create and save the category
         const category = new CategoryModel(validatedData);
         await category.save();

         return SendResponse.success(res, "Category created successfully", {
            category,
         });
      } catch (error: any) {
         return SendResponse.serverError(res, "Failed to create category");
      }
   },

   async all(req: Request, res: Response): Promise<void> {
      try {
         const search = (req.query.search as string) || "";
         const page = Number.parseInt(req.query.page as string) || 1;
         const perPage = Number.parseInt(req.query.perPage as string) || 10;
         const categoryType = (req.query.categoryType as string) || "all"; // Add this line

         const result = await CategoryService.getAllCategories(
            search,
            page,
            perPage,
            categoryType // Pass the new parameter
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
         const categoryType = (req.query.categoryType as string) || undefined; // Optional

         const results = await CategoryService.searchCategories(
            search,
            categoryType
         );

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
            { new: true }
         );

         SendResponse.success(
            res,
            "Category updated successfully",
            updatedCategory
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
               "Cannot delete category. It has associated menu items."
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
