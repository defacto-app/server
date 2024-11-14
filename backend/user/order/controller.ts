import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";
import OrderModel from "../../admin/order/model";

const OrderController = {
	// Create a new restaurant order
	async createRestaurantOrder(req: Request, res: Response): Promise<void> {
		try {
			// Step 1: Validate the request payload using the CreateOrderSchema
			const value = req.body;

			// Step 2: Extract data from validated request payload
			const {
				userId,
				dropOffDetails,
				pickupDetails,
				menuItems,
				charge,
				description,
				cashPaymentLocation,
			} = value;

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
				menuItems: menuItems.map((item: any) => ({
					name: item.name,
					quantity: item.quantity,
					price: item.price,
				})),
			});

			// Step 4: Save the order to the database
			const savedOrder = await newOrder.save();

			// Step 5: Send success response with the created order
			SendResponse.created(res, "Order created successfully", savedOrder);
		} catch (error) {
			console.error("Error creating order:", error);
			// Step 6: Handle any server errors and send a 500 response
			SendResponse.serverError(res, "Error creating order");
		}
	},
};

export default OrderController;
