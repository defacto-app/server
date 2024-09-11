import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";
import RestaurantModel from "../../restaurant/model";
import type { SortOrder } from "mongoose";
import { uploadToCloudinary } from "../../helper/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
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
		const restaurant = res.locals.restaurantItem as any;
		const { name } = req.body;

		try {
			restaurant.name = name;

			await restaurant.save();

			SendResponse.success(res, "Restaurant updated", restaurant);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
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
};

export default AdminRestaurantController;
