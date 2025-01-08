import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import SendResponse from "../../../libs/response-helper";
import MenuModel from "../../../menu/model";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../../../helper/cloudinary";
import { paginate } from "../../../utils/pagination";
import MenuService from "./service";
import { createMenuSchema, updateMenuSchema } from "./validator";
import slugify from "slugify";
// Set up Cloudinary configuration

const AdminRestaurantMenuController = {
   async all(req: Request, res: Response): Promise<void> {
      const restaurant = res.locals.restaurantItem as any;
      const search: string = (req.query.search as string) || "";
      const page: number = Number.parseInt(req.query.page as string) || 1;
      const perPage: number =
         Number.parseInt(req.query.perPage as string) || 10;
      const includeDeleted = req.query.includeDeleted === "true"; // Query parameter for filtering deleted items

      try {
         const result = await MenuService.getAllMenus(
            restaurant.publicId,
            search,
            page,
            perPage,
            includeDeleted
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
   async create(req: Request, res: Response): Promise<Response> {
      // Validate the request body using zod
      const validationResult = createMenuSchema.safeParse(req.body);

      if (!validationResult.success) {
         // Format validation errors
         const formattedErrors: any = {};
         for (const error of validationResult.error.errors) {
            const path = error.path.join(".");
            formattedErrors[path] = error.message;
         }

         // Send a bad request response with the formatted errors
         return SendResponse.badRequest(res, formattedErrors);
      }

      const validatedData = validationResult.data;

      try {
         // Create a new menu item using the validated data
         const restaurant = res.locals.restaurantItem as any;
         const newMenu = await MenuService.createMenu(
            validatedData,
            restaurant.publicId
         );

         // Return success response
         return SendResponse.success(
            res,
            "Menu item created successfully",
            newMenu
         );
      } catch (error: any) {
         return SendResponse.badRequest(res, error.message);
      }
   },

   //

   async update(req: Request, res: Response): Promise<Response> {
      const menu = res.locals.menuItem as any;

      // Validate the request body using zod
      const validationResult = updateMenuSchema.safeParse(req.body);

      if (!validationResult.success) {
         // Format validation errors
         const formattedErrors: any = {};
         for (const error of validationResult.error.errors) {
            const path = error.path.join(".");
            formattedErrors[path] = error.message;
         }

         // Send a bad request response with the formatted errors
         return SendResponse.badRequest(res, formattedErrors);
      }

      const validatedData = validationResult.data as any;

      try {
         // Handle slug regeneration if the name is being updated
         if (validatedData.name) {
            let generatedSlug = slugify(validatedData.name, { lower: true, strict: true });

            // Check for existing slugs to avoid duplicates
            const existingMenu = await MenuModel.findOne({
               slug: generatedSlug,
               publicId: { $ne: menu.publicId },
            });

            if (existingMenu) {
               const randomString = uuidv4().slice(0, 6);
               generatedSlug = `${generatedSlug}-${randomString}`;
            }

            validatedData.slug = generatedSlug;
         }

         // Update the menu item using the validated data
         const updatedMenu = await MenuModel.findOneAndUpdate(
            { publicId: menu.publicId },
            validatedData,
            { new: true, runValidators: true } // Apply validators and return updated document
         );

         // Send success response
         if (updatedMenu) {
            return SendResponse.success(
               res,
               "Menu item updated successfully",
               updatedMenu
            );
         }
         return SendResponse.notFound(res, "Menu item not found");
      } catch (error: any) {
         console.log(error);
         return SendResponse.serverError(res, error.message);
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

          // Update the menu document in the database
          const updatedMenu = await MenuModel.findOneAndUpdate(
              { publicId: menu.publicId }, // Match menu by publicId
              { $set: { image: optimizedUrl } }, // Update the image field
              { new: true } // Return the updated document
          );

          if (!updatedMenu) {
              SendResponse.notFound(
                  res,
                  `Sorry, Menu ${menu.publicId} not found or cannot be updated`
              );
              return;
          }

          SendResponse.success(
              res,
              "Menu image uploaded successfully",
              optimizedUrl
          );
      } catch (error: any) {
          console.log(error.message);
          SendResponse.serverError(res, error.message);
      }
  },


   async allMenu(req: Request, res: Response): Promise<void> {
      const page: number = Number.parseInt(req.query.page as string) || 1;
      const perPage: number =
         Number.parseInt(req.query.perPage as string) || 20;
      const search: string = (req.query.search as string) || ""; // Get search term

      try {
         const result = await MenuService.getAllMenusWithPipeline(
            search,
            page,
            perPage
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
            SendResponse.notFound(
               res,
               "Menu item not found or already deleted"
            );
            return;
         }

         SendResponse.success(
            res,
            "Menu item soft deleted successfully",
            updatedMenu
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
            restoredMenu
         );
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },

   async getDeleted(req: Request, res: Response): Promise<void> {
      const restaurant = res.locals.restaurantItem as any;
      const page: number = Number.parseInt(req.query.page as string) || 1;
      const perPage: number =
         Number.parseInt(req.query.perPage as string) || 10;

      try {
         const query = { parent: restaurant.publicId };

         const paginationResult = await paginate(
            MenuModel,
            page,
            perPage,
            { ...query, isDeleted: true }, // Only fetch soft-deleted items
            undefined, // projection
            { deletedAt: -1 } // sort
         );

         SendResponse.success(
            res,
            "Soft-deleted menu items retrieved",
            paginationResult
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
            }
         );

         SendResponse.success(
            res,
            `${updatedMenus.modifiedCount} menu items soft deleted`
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
            }
         );

         SendResponse.success(
            res,
            `${updatedMenus.modifiedCount} menu items restored`
         );
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },

   async toggleAvailability(req: Request, res: Response) {
      const menu = res.locals.menuItem as any;

      try {
         const updatedMenu = (await MenuModel.findOneAndUpdate(
            { publicId: menu.publicId },
            { available: !menu.available },
            { new: true } // Return the updated document
         )) as any;

         if (!updatedMenu) {
            return SendResponse.notFound(
               res,
               "Menu not found for updating availability"
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
