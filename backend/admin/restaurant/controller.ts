import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";
import RestaurantModel from "../../restaurant/model";
import type { SortOrder } from "mongoose";
import { uploadToCloudinary } from "../../helper/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import CategoryModel from "./category/model";
import { updateRestaurantSchema } from "./validator";
import MenuModel from "../../menu/model";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { RestaurantService } from "./service";

// Set up Cloudinary configuration

const AdminRestaurantController = {
   async all(req: Request, res: Response): Promise<void> {
      // Extract page, perPage, and search term from request query. Set default values if not provided.
      const page: number = Number.parseInt(req.query.page as string) || 1;
      const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
      const search: string = (req.query.search as string) || ""; // Get search term

      try {
         // Create a search query using regex to match the search term (case-insensitive)
         const searchQuery = search
            ? { name: { $regex: search, $options: "i" } } // Search by restaurant name (case-insensitive)
            : {}; // If no search term, return all restaurants

         // Define the sort order
         const sort: { [key: string]: SortOrder } = { createdAt: -1 }; // Sort by createdAt in descending order

         // Use aggregation to fetch data without menu count
         const aggregationPipeline = [
            { $match: searchQuery }, // Match search query
            {
               $lookup: {
                  from: "categories", // Collection to join (categories)
                  localField: "category", // Field from the restaurant collection
                  foreignField: "publicId", // Field from the categories collection
                  as: "categoryDetails", // Alias for the joined data
               },
            },
            {
               $addFields: {
                  category: { $arrayElemAt: ["$categoryDetails.name", 0] }, // Replace category ID with its name
               },
            },
            {
               $project: {
                  categoryDetails: 0, // Exclude the categoryDetails array after extracting the name
               },
            },
            { $sort: sort }, // Sort results by name
            { $skip: (page - 1) * perPage }, // Pagination: skip documents
            { $limit: perPage }, // Pagination: limit documents
         ] as any;

         const data = await RestaurantModel.aggregate(aggregationPipeline);

         // Calculate the total number of restaurants (for pagination)
         const total = await RestaurantModel.countDocuments(searchQuery);

         const paginationResult = {
            data,
            meta: {
               totalPages: Math.ceil(total / perPage),
               page,
               perPage,
               total,
            },
         };

         SendResponse.success(res, "Restaurants retrieved", paginationResult);
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },


   async one(req: Request, res: Response): Promise<Response> {
      console.log("res.locals.restaurantItem");
      const data = res.locals.restaurantItem as any;

      try {
         return SendResponse.success(res, "Restaurant retrieved", data);
      } catch (error: any) {
         return SendResponse.serverError(res, error.message);
      }
   },

   async update(req: Request, res: Response): Promise<Response> {
      try {
         const restaurant = res.locals.restaurantItem; // Fetch the current restaurant from middleware
         const validationResult = updateRestaurantSchema.safeParse(req.body);

         if (!validationResult.success) {
            const formattedErrors: any = {};
            for (const error of validationResult.error.errors) {
               const path = error.path.join(".");
               formattedErrors[path] = error.message;
            }

            return SendResponse.badRequest(res, formattedErrors);
         }

         const validatedData = validationResult.data as any;

         // Handle slug regeneration if the name is being updated
         if (validatedData.name) {
            let generatedSlug = slugify(validatedData.name, { lower: true, strict: true });
            const existingRestaurant = await RestaurantModel.findOne({
               slug: generatedSlug,
               publicId: { $ne: restaurant.publicId }, // Exclude the current restaurant
            });

            if (existingRestaurant) {
               const randomString = uuidv4().slice(0, 6);
               generatedSlug = `${generatedSlug}-${randomString}`;
            }

            validatedData.slug = generatedSlug; // Set the new slug
         }

         const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
            { publicId: restaurant.publicId },
            { $set: validatedData },
            { new: true, runValidators: true }
         );

         if (!updatedRestaurant) {
            return SendResponse.notFound(res, "Restaurant not found");
         }

         return SendResponse.success(
            res,
            "Restaurant updated successfully",
            updatedRestaurant
         );
      } catch (error: any) {
         console.log(error.message, "error");
         return SendResponse.serverError(res, error.message);
      }
   },


   async create(req: Request, res: Response): Promise<Response> {
      try {
         // Pass the request body to the service
         const newRestaurant = await RestaurantService.createRestaurant(req.body);

         // Return success response
         return SendResponse.success(res, "Restaurant created successfully", newRestaurant);
      } catch (error: any) {
         if (error.name === "ZodError") {
            // Format validation errors
            const formattedErrors: any = {};
            for (const err of error.errors) {
               const path = err.path.join(".");
               formattedErrors[path] = err.message;
            }
            return SendResponse.badRequest(res, formattedErrors);
         }

         // Handle other errors
         return SendResponse.badRequest(res, error.message);
      }
    },

   async delete(req: Request, res: Response): Promise<void> {
      try {
         // The restaurant is already loaded in res.locals by middleware
         const restaurant = res.locals.restaurantItem as any;

         if (!restaurant) {
            // If no restaurant is found, return a 404 error
            SendResponse.notFound(res, "Restaurant not found");
         }

         // Use deleteOne() to remove the document
         await restaurant.deleteOne();

         // Return success response
         SendResponse.success(res, "Restaurant deleted successfully");
      } catch (error: any) {
         // Return server error response in case of any exceptions
         SendResponse.serverError(res, error.message);
      }
   },

   async upload(req: Request, res: Response): Promise<void> {
      const restaurant = res.locals.restaurantItem as any;

      console.log(req.file, restaurant, "upload restuarant !!");
      try {
         if (!req.file) {
            SendResponse.badRequest(res, "No image file uploaded");
            return;
         }

         // Upload the file to Cloudinary
         const result = await uploadToCloudinary(
            req.file.path,
            "defacto/restaurant"
         );

         // Remove file from server after upload
         fs.unlinkSync(req.file.path);

         // Generate an optimized URL
         const optimizedUrl = cloudinary.url(result.public_id, {
            transformation: [
               { width: 800, crop: "scale" },
               { fetch_format: "auto", quality: "auto" },
            ],
         });

         // update the restaurant with the image URL

         restaurant.image = optimizedUrl;

         await restaurant.save();

         SendResponse.success(
            res,
            "Restaurant image uploaded successfully",
            optimizedUrl
         );
      } catch (error: any) {
         console.error(error);
         SendResponse.serverError(res, error.message);
      }
   },

   async categories(req: Request, res: Response): Promise<void> {
      try {
         const search = (req.query.search as string) || "";
         const page = Number.parseInt(req.query.page as string) || 1;
         const perPage = Number.parseInt(req.query.perPage as string) || 10;

         // Build the search query
         const matchStage: any = {};
         if (search) {
            matchStage.name = { $regex: search, $options: "i" }; // Case-insensitive search
         }
         const sortField = req.query.sortBy as string;
         const sortOrder = req.query.sortOrder as "asc" | "desc";
         // Aggregation pipeline
         const categories = await CategoryModel.aggregate([
            { $match: matchStage }, // Apply the search filter here
            {
               $lookup: {
                  from: "menus",
                  localField: "_id",
                  foreignField: "categoryId",
                  as: "menuItems",
               },
            },
            {
               $lookup: {
                  from: "restaurants",
                  localField: "_id",
                  foreignField: "categoryId",
                  as: "restaurants",
               },
            },
            {
               $addFields: {
                  menuCount: { $size: "$menuItems" },
                  restaurantCount: { $size: "$restaurants" },
               },
            },
            {
               $project: {
                  name: 1,
                  slug: 1,
                  publicId: 1,
                  menuCount: 1,
                  restaurantCount: 1,
                  createdAt: 1,
                  updatedAt: 1,
               },
            },
            { $skip: (page - 1) * perPage },
            { $limit: perPage },
         ]);

         if (sortField) {
            categories.push({
               $sort: {
                  [sortField]: sortOrder === "desc" ? -1 : 1,
               },
            });
         }

         // Count total categories matching the query
         const total = await CategoryModel.countDocuments(matchStage);

         SendResponse.success(res, "Categories retrieved", {
            data: categories,
            meta: {
               page,
               perPage,
               total,
               totalPages: Math.ceil(total / perPage),
            },
         });
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },

   async deleteCategory(req: Request, res: Response): Promise<void> {
      try {
         const category = res.locals.categoryItem as any;

         if (!category) {
            SendResponse.notFound(res, "Category not found");
            return;
         }

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

export default AdminRestaurantController;
