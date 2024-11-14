import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import OrderModel from "../admin/order/model";
import type { AuthDataType } from "../auth/model";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../helper/cloudinary";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";


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
			console.log(req.body, "Package data");

			const user = res.locals.user as AuthDataType;

			console.log(user, "User data");

			// Handle the base64 image upload
			const base64Image = req.body.package_image;
			let optimizedUrl = "";

			if (base64Image) {
				// Ensure the uploads directory exists
				const uploadsDir = path.join(__dirname, 'uploads');
				if (!fs.existsSync(uploadsDir)) {
					fs.mkdirSync(uploadsDir);
				}

				// Generate a unique filename
				const filename = `temp_image_${uuidv4()}.jpg`;
				const tempFilePath = path.join(uploadsDir, filename);

				// Decode the base64 string and save it as a temporary file
				const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
				fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));

				// Upload the temporary file to Cloudinary
				const result = await uploadToCloudinary(tempFilePath, "defacto/packages");

				// Remove the temporary file from the server after upload
				fs.unlinkSync(tempFilePath);

				// Generate an optimized URL
				optimizedUrl = cloudinary.url(result.public_id, {
					transformation: [
						{ width: 800, crop: "scale" },
						{ fetch_format: "auto", quality: "auto" },
					],
				});
			}

			// Create the package record with the Cloudinary URL
			const newPackage = new OrderModel({
				userId: user.publicId,
				description: req.body.description,
				pickupDate: req.body.pickupDate,
				package_image: optimizedUrl, // Store Cloudinary URL instead of base64 data
				type: "package",
				pickupDetails: {
					location: req.body.pickupDetails.location,
					address: req.body.pickupDetails.address,
					name: "katalyst",
					phone: "08012345678"
				},
				dropOffDetails: {
					location: req.body.dropOffDetails.location,
					address: req.body.dropOffDetails.address,
					name: req.body.dropOffDetails.name,
					phone: req.body.dropOffDetails.phone
				},
				charge: req.body.charge,
			});

			// Save the new package to the database
			await newPackage.save();

			// Send a successful response back to the client
			SendResponse.success(res, "Created New Package Delivery.", {
				orderId: newPackage.publicId,
			});
		} catch (error: any) {
			// Handle possible errors
			SendResponse.serverError(res, error.message);
		}
	}

};

export default OrderController;
