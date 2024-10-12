import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { AddressType } from "../../types";

// Define the structure of the Order document
export interface OrderDataType extends Document {
	publicId: string;
	createdAt: Date;
	updatedAt: Date;
	type: "food" | "package"; // Type of order: food (restaurant) or package (delivery)
	typeId: string; // For linking to external services if needed (e.g., restaurant or package ID)
	dropOffDetails: {
		name: string;
		phone: string;
		email: string;
		address: AddressType;
	};
	pickupDetails: {
		name: string;
		phone: string;
		email: string;
		address: AddressType;
	};
	charge: number;
	status: "pending" | "completed" | "cancelled";
	pickupTime: Date | null;
	assignedTo: string; // Driver or delivery person assigned
	isInstant: boolean | null;
	deliveryMode?: "Motorcycle" | "Tricycle" | "Bicycle" | "Foot"; // Optional for package delivery
	description: string; // Common description field for any notes
	cashPaymentLocation: "Pick-up" | "Delivery"; // Location for cash payment
	cashAvailable: { available: boolean; amount: number };
	packageContent?: string[]; // Only used for package delivery
	menuItems?: { name: string; quantity: number; price: number }[]; // Only used for restaurant orders
}

// Define the schema fields for the unified order model
const orderSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: uuidv4,
		unique: true,
		minLength: 1,
		maxLength: 255,
	},
	createdAt: {
		type: Date,
		required: true,
		default: new Date(),
	},
	updatedAt: {
		type: Date,
		required: true,
		default: new Date(),
	},
	type: {
		type: String,
		required: true,
		enum: ["food", "package"], // Specify if it's a food or package order
	},
	dropOffDetails: {
		name: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: true },
		address: { type: Object, required: true }, // Using AddressType
	},
	pickupDetails: {
		name: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: true },
		address: { type: Object, required: true },
	},
	charge: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		enum: ["pending", "completed", "cancelled"],
		default: "pending",
	},
	pickupTime: { type: Date, default: null },
	assignedTo: { type: String }, // Driver or person assigned to the order
	isInstant: { type: Boolean, default: null },
	deliveryMode: {
		type: String,
		enum: ["Motorcycle", "Tricycle", "Bicycle", "Foot"],
		required: true,
	},
	description: { type: String },
	cashPaymentLocation: {
		type: String,
		enum: ["Pick-up", "Delivery"],
		required: true,
	},
	cashAvailable: {
		available: { type: Boolean, default: false },
		amount: { type: Number, default: 0 },
	},
	// Specific fields for restaurant orders
	menuItems: [
		{
			name: { type: String },
			quantity: { type: Number },
			price: { type: Number },
		},
	],
};

// Define the schema and apply timestamps for automatic tracking of createdAt and updatedAt
export const OrderSchema: Schema = new Schema(orderSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: false,
});

// Create a Mongoose model for the Order based on the schema
class OrderModel extends mongoose.model<OrderDataType>("orders", OrderSchema) {}

export default OrderModel;
