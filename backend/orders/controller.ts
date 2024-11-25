import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import OrderModel from "../admin/order/model";
import type { AuthDataType } from "../auth/model";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../helper/cloudinary";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { OrderValidator } from "./validator";

const OrderController = {
	async all(req: Request, res: Response): Promise<void> {
		// const user = res.locals.user as any;
		try {
			console.log(req.query, "Query params");
			const orders = await OrderModel.find();

			SendResponse.success(res, "Orders retrieved", orders);
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
			// Validate the request body
			const validation = await OrderValidator.validateDelivery(req.body);

			if (!validation.success) {
				SendResponse.badRequest(res, "Validation failed", validation.errors);
				return; // Early return after validation failure
			}

			const validatedData = validation.data;
			const user = res.locals.user as AuthDataType;

			// Handle the base64 image upload
			let optimizedUrl = "";
			if (validatedData?.package_image) {
				const uploadsDir = path.join(__dirname, "uploads");
				if (!fs.existsSync(uploadsDir)) {
					fs.mkdirSync(uploadsDir);
				}

				const filename = `temp_image_${uuidv4()}.jpg`;
				const tempFilePath = path.join(uploadsDir, filename);

				const base64Data = validatedData.package_image.replace(
					/^data:image\/\w+;base64,/,
					"",
				);
				fs.writeFileSync(tempFilePath, Buffer.from(base64Data, "base64"));

				const result = await uploadToCloudinary(
					tempFilePath,
					"defacto/packages",
				);
				fs.unlinkSync(tempFilePath);

				optimizedUrl = cloudinary.url(result.public_id, {
					transformation: [
						{ width: 800, crop: "scale" },
						{ fetch_format: "auto", quality: "auto" },
					],
				});
			}

			// Create the package with validated data
			const newPackage = new OrderModel({
				userId: user.publicId,
				...validatedData,
				package_image: optimizedUrl,
			});

			await newPackage.save();

			SendResponse.success(res, "Created New Package Delivery.", {
				orderId: newPackage.publicId,
			});
		} catch (error: any) {
			console.log(error);
			SendResponse.serverError(res, error.message);
		}
	},
};

export default OrderController;
