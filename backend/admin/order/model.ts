//
//
//

import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { AddressType } from "../../../types";

// Generate a simple orderId for users (e.g., "ORD-123456")
const generateOrderId = (): string => {
	const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit number
	return `DFT-${randomNumber}`;
};
// Define the structure of the Order document
export interface OrderDataType extends Document {
	publicId: string;

	createdAt: Date;
	updatedAt: Date;
	type: "food" | "package";
	userId: string;
	typeId: string;
	orderId: string;
	package_image: string;
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
	assignedTo: string;
	isInstant: boolean | null;
	description: string;
	//
	//
	packageContent?: string[];
	menuItems?: { name: string; quantity: number; price: number }[];
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
	package_image: {
		type: String,
		required: false,
	},
	orderId: {
		type: String,
		required: true,
		unique: true, // Ensuring the orderId is also unique
		default: generateOrderId, // Custom function to generate a user-friendly orderId
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
		enum: ["food", "package"],
	},
	pickupDetails: {
		name: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: false },
		address: { type: Object, required: true }, // Using AddressType
	},
	dropOffDetails: {
		name: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: false },
		address: { type: Object, required: true }, // Using AddressType
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
	assignedTo: { type: String },
	isInstant: { type: Boolean, default: null },

	description: { type: String },

	restaurantOrder: [
		{
			name: { type: String, required: true },
			quantity: { type: Number, required: true },
			price: { type: Number, required: true },
		},
	],
	packageContent: [{ type: String }],
};

// Define the schema and apply timestamps for automatic tracking of createdAt and updatedAt
export const OrderSchema: Schema = new Schema(orderSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: false,
});

// Create a Mongoose model for the Order based on the schema
const OrderModel = mongoose.model<OrderDataType>("orders", OrderSchema);

export default OrderModel;

