import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";
import RestaurantModel from "../../restaurant/model";
import type { SortOrder } from "mongoose";
import { uploadToCloudinary } from "../../helper/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import CategoryModel from "../../category/model";
import { updateRestaurantSchema } from "./validator";
import MenuModel from "../../menu/model";
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
			const sort: { [key: string]: SortOrder } = { name: 1 }; // Sort by name in ascending order

			// Use aggregation to include menu item count
			const aggregationPipeline = [
				{ $match: searchQuery }, // Match search query
				{
					$lookup: {
						from: "menus", // Collection to join (menus)
						localField: "publicId", // Field from the restaurant collection
						foreignField: "parent", // Field from the menu collection (assuming `parent` is the restaurant's publicId)
						as: "menuItems", // Alias for the joined data
					},
				},
				{
					$addFields: {
						menuCount: { $size: "$menuItems" }, // Add field with the count of menu items
					},
				},
				{
					$project: {
						menuItems: 0, // Exclude the actual menuItems array if you don't need it
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

	async one(req: Request, res: Response): Promise<void> {
		const data = res.locals.restaurantItem as any;

		try {
			SendResponse.success(res, "Restaurant retrieved", data);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async update(req: Request, res: Response): Promise<void> {
		try {
			const restaurant = res.locals.restaurantItem;
			const validationResult = updateRestaurantSchema.safeParse(req.body);

			if (!validationResult.success) {
				const formattedErrors: any = {};
				for (const error of validationResult.error.errors) {
					const path = error.path.join(".");
					formattedErrors[path] = error.message;
				}

				SendResponse.badRequest(res, formattedErrors);
			}

			const validatedData = validationResult.data;

			const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
				restaurant._id,
				{ $set: validatedData },
				{ new: true, runValidators: true },
			);

			SendResponse.success(
				res,
				"Restaurant updated successfully",
				updatedRestaurant,
			);
		} catch (error: any) {
			SendResponse.badRequest(res, "", error);
		}
	},
	async create(req: Request, res: Response): Promise<void> {
		const { name, category, address, phone, email, openingHours } = req.body;

		try {
			// Create a new restaurant instance
			const newRestaurant = new RestaurantModel({
				name,
				category,
				address,
				phone,
				email,
				openingHours,
			});

			// Save the new restaurant to the database
			await newRestaurant.save();

			// Return success response
			SendResponse.success(
				res,
				"Restaurant created successfully",
				newRestaurant,
			);
		} catch (error: any) {
			SendResponse.badRequest(res, error.message);
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
				"defacto/restaurant",
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
				optimizedUrl,
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
			const sortOrder = req.query.sortOrder as 'asc' | 'desc';
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
						[sortField]: sortOrder === 'desc' ? -1 : 1
					}
				});
			}

         // Count total categories matching the query
         const totalCategories = await CategoryModel.countDocuments(matchStage);

         SendResponse.success(res, "Categories retrieved", {
            data: categories,
            meta: {
               page,
               perPage,
               totalCategories,
               totalPages: Math.ceil(totalCategories / perPage),
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
               "Cannot delete category. It has associated menu items.",
            );
         }

         // If no associations, delete the category
         await category.deleteOne();

         SendResponse.success(res, "Category deleted successfully");
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   }

};

export default AdminRestaurantController;
