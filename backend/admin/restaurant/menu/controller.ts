import type { Request, Response } from "express";
/*import paginate from "../../utils/pagination";
import RestaurantModel from "../../restaurant/model";
import type { SortOrder } from "mongoose";
import { uploadToCloudinary } from "../../helper/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";*/
import SendResponse from "../../../libs/response-helper";
import MenuModel from "../../../menu/model";
// Set up Cloudinary configuration

const AdminRestaurantMenuController = {
	async create(req: Request, res: Response): Promise<void> {

		const restaurant = res.locals.restaurantItem as any;
		const { name, category, price, available, image } = req.body;

		console.log(req.body, "create menu !!");
		try {
			// Create a new menu instance
			const newMenu = new MenuModel({
				name,
				category,
				price,
				available,
				image,
				parent: restaurant.publicId,
			});

			// Save the new menu item to the database
			await newMenu.save();

			// Return success response
			SendResponse.success(
				res,
				"Menu item created successfully",
				newMenu,
			);
		} catch (error: any) {
			SendResponse.badRequest(res, error.message);
		}
	},

	async all(req: Request, res: Response): Promise<void> {
		const restaurant = res.locals.restaurantItem as any;

		try {
			const menuItems = await MenuModel.find({ parent: restaurant.publicId });

			SendResponse.success(res, "Menu items retrieved", menuItems);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}


	/* async all(req: Request, res: Response): Promise<void> {
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

         // Use the searchQuery in the pagination
         const paginationResult = await paginate(
            RestaurantModel,
            page,
            perPage,
            searchQuery,
            undefined,
            sort, // Pass the sort parameter
         );

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
         const result = await uploadToCloudinary(req.file.path, "defacto/restaurant");

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

         SendResponse.success(res, "Restaurant image uploaded successfully", optimizedUrl);
      } catch (error: any) {
         console.error(error);
         SendResponse.serverError(res, error.message);
      }
   },*/
};

export default AdminRestaurantMenuController;


