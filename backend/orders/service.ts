import { paginate } from "../utils/pagination";
import OrderModel from "../admin/order/model";
import type { UserDataType } from "../user/model";

import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../helper/cloudinary";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

interface GetOrdersParams {
   orderId?: string;
   sort?: string;
   page: number;
   perPage: number;
   type?: string;
}

interface RestaurantOrderItem {
   name: string;
   quantity: number;
   price: number;
}

interface CreateRestaurantOrderParams {
   userId: string;
   dropOffDetails: any;
   pickupDetails: any;
   deliveryCharge: number;
   restaurantOrder: RestaurantOrderItem[];
   charge: number;
   description?: string;
   cashPaymentLocation?: any;
}

interface RestaurantOrderItem {
   name: string;
   quantity: number;
   price: number;
}

interface CreateRestaurantOrderParams {
   userId: string;
   dropOffDetails: any;
   pickupDetails: any;
   deliveryCharge: number;
   restaurantOrder: RestaurantOrderItem[];
   charge: number;
   description?: string;
   cashPaymentLocation?: any;
   parentId: string;
}

interface PackageDeliveryData {
   description?: string;
   pickupDate?: Date;
   pickupDetails: any;
   dropOffDetails: any;
   charge: number;
   package_image?: string;
}

class OrderService {
   static async getOrders(params: GetOrdersParams) {
      const { orderId, sort, page, perPage, type } = params;

      // Build the query object
      const query: Record<string, any> = {};

      if (orderId) {
         query.orderId = orderId; // Assuming orderId maps to the `orderId` field
      }

      // Add type filter if provided
      if (type) {
         query.type = type; // Ensure the `type` matches "food" or "package"
      }

      // Determine the sorting order, defaulting to descending
      const sortOrder =
         sort === "asc" ? { updatedAt: 1 } : ({ updatedAt: -1 } as any);

      // Use the paginate function
      return await paginate(
         OrderModel,
         page,
         perPage,
         query,
         null, // No specific projection
         sortOrder
      );
   }

   static async getOrder(publicId: string) {
      return await OrderModel.findOne({ publicId });
   }

   static async createRestaurantOrder(
      orderData: CreateRestaurantOrderParams,
      user: any,
      restaurantData: any
   ): Promise<void> {
      const {
         deliveryCharge,
         restaurantOrder,
         charge,
         description,
         cashPaymentLocation,
      } = orderData;

      // Create a new order document for a restaurant order
      const newOrder = new OrderModel({
         type: "food", // This is a restaurant order
         userId: user.userId,
         charge,
         description,
         cashPaymentLocation,
         deliveryCharge,
         isInstant: true,
         restaurant_image: restaurantData.image,
         restaurant_name: restaurantData.name,
         restaurant_slug: restaurantData.slug,
         restaurantId: restaurantData.publicId,
         restaurantOrder: restaurantOrder.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            restaurantId: user.parent,
         })),

         dropOffDetails: {
            name: user.firstName,
            email: user.email,
            phone: user.phoneNumber,

            address: {
               location: orderData.dropOffDetails.address.address,
               coordinates: {
                  lat: orderData.dropOffDetails.address.location.lat,
                  lng: orderData.dropOffDetails.address.location.lng,
               },
            },
         },

         pickupDetails: {
            name: restaurantData.name,
            email: restaurantData.email,
            phone: restaurantData.phoneNumber,
            address: {
               location: restaurantData.address.location,
               coordinates: {
                  lat: 0,
                  lng: 0,
               },
            },
         },
      });

      // Save the order to the database
      await newOrder.save();
   }

   static async createPackageDelivery(
      validatedData: PackageDeliveryData,
      user: UserDataType
   ): Promise<{ orderId: string }> {
      let optimizedUrl = "";

      // Handle optional base64 image upload
      if (validatedData?.package_image) {
         optimizedUrl = await OrderService.uploadPackageImage(
            validatedData.package_image
         );
      }

      // Create the package order
      const newPackage = new OrderModel({
         userId: user.userId,
         type: "package",
         description: validatedData?.description,
         pickupTime: validatedData?.pickupDate || new Date(),
         pickupDetails: {
            name: user.firstName,
            email: user.email,
            phone: user.phoneNumber,
            address: {
               ...validatedData?.pickupDetails.address,
            },
         },
         dropOffDetails: {
            ...validatedData?.dropOffDetails,
         },
         createdAt: new Date(),
         charge: validatedData?.charge,
         package_image: optimizedUrl, // Will be empty if no image is provided
      });

      await newPackage.save();

      return { orderId: newPackage.publicId };
   }

   static async uploadPackageImage(base64Image: string): Promise<string> {
      try {
         const uploadsDir = path.join(__dirname, "uploads");
         if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
         }

         const filename = `temp_image_${uuidv4()}.jpg`;
         const tempFilePath = path.join(uploadsDir, filename);

         // Extract base64 image data
         const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

         // Write base64 data to a temporary file
         fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

         // Upload to Cloudinary
         const result = await uploadToCloudinary(
            tempFilePath,
            "defacto/packages"
         );

         // Delete the temporary file after upload
         fs.unlinkSync(tempFilePath);

         // Generate optimized URL using Cloudinary transformations
         return cloudinary.url(result.public_id, {
            transformation: [
               { width: 800, crop: "scale" },
               { fetch_format: "auto", quality: "auto" },
            ],
         });
      } catch (error: any) {
         console.error("Image upload failed:", error.message);
         throw new Error("Invalid image file");
      }
   }
}

export default OrderService;

//
//
//
//
