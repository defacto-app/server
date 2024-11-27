import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import OrderModel from "../admin/order/model";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../helper/cloudinary";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { OrderValidator } from "./validator";
import type { UserDataType } from "../user/model";
import { paginate } from "../utils/pagination";

const OrderController = {
	async all(req: Request, res: Response): Promise<void> {
		try {
			console.log(req.query, "Query params");

			const { orderId, sort, page = 1, perPage = 10, type } = req.query;

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
			const result = await paginate(
				OrderModel,
				Number.parseInt(page as string, 10),
				// biome-ignore lint/style/useNumberNamespace: <explanation>
				parseInt(perPage as string, 10),
				query,
				null, // No specific projection
				sortOrder,
			);

			SendResponse.success(res, "Orders retrieved", result);
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},

	async restaurant(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;
		try {
			// Step 1: Validate the request payload using the CreateOrderSchema
			const value = req.body;

			// Step 2: Extract data from validated request payload
			const {
				userId,
				dropOffDetails,
				pickupDetails,
				deliveryCharge,
				restaurantOrder,
				charge,
				description,
				cashPaymentLocation,
			} = value;

			console.log({ user, value });

			// Step 3: Create a new order document for a restaurant order
			const newOrder = new OrderModel({
				type: "food", // This is a restaurant order
				userId,
				dropOffDetails,
				pickupDetails,
				charge,
				status: "pending", // Initial status of the order
				description,
				cashPaymentLocation,
				deliveryCharge,
				isInstant: true,
				restaurantOrder: restaurantOrder.map((item: any) => ({
					name: item.name,
					quantity: item.quantity,
					price: item.price,
				})),
			});

			// Step 4: Save the order to the database
			await newOrder.save();

			// Step 5: Send success response with the created order
			SendResponse.created(res, "Order created successfully");
		} catch (error) {
			console.error("Error creating order:", error);
			// Step 6: Handle any server errors and send a 500 response
			SendResponse.serverError(res, "Error creating order");
		}
	},

	async package_delivery(req: Request, res: Response): Promise<void> {
		try {
			const user = res.locals.user as UserDataType;

			// Validate the request body
			const validation = await OrderValidator.validateDelivery(req.body);

			if (!validation.success) {
				SendResponse.badRequest(res, "Validation failed", validation.errors);
				return; // Early return after validation failure
			}

			const validatedData = validation.data;

			// Initialize optimizedUrl to an empty string
			let optimizedUrl = "";

			// Handle the optional base64 image upload
			if (validatedData?.package_image) {
				try {
					const uploadsDir = path.join(__dirname, "uploads");
					if (!fs.existsSync(uploadsDir)) {
						fs.mkdirSync(uploadsDir);
					}

					const filename = `temp_image_${uuidv4()}.jpg`;
					const tempFilePath = path.join(uploadsDir, filename);

					// Extract base64 image data
					const base64Data = validatedData.package_image.replace(
						/^data:image\/\w+;base64,/,
						"",
					);

					// Write base64 data to a temporary file
					fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

					// Upload to Cloudinary
					const result = await uploadToCloudinary(
						tempFilePath,
						"defacto/packages",
					);

					// Delete the temporary file after upload
					fs.unlinkSync(tempFilePath);

					// Generate optimized URL using Cloudinary transformations
					optimizedUrl = cloudinary.url(result.public_id, {
						transformation: [
							{ width: 800, crop: "scale" },
							{ fetch_format: "auto", quality: "auto" },
						],
					});
				} catch (error: any) {
					console.error("Image upload failed:", error.message);
					SendResponse.badRequest(res, "Invalid image file");
					return; // Early return if the image upload fails
				}
			}

			// Create the package with validated data
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
				charge: validatedData?.charge,

				package_image: optimizedUrl, // Will be empty if no image is provided
			});

			await newPackage.save();

			SendResponse.success(res, "Created New Package Delivery.", {
				orderId: newPackage.publicId,
			});
		} catch (error: any) {
			console.error(error);
			SendResponse.serverError(res, error.message);
		}
	},
};

export default OrderController;
