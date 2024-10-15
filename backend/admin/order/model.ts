//
//
//

import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { AddressType } from "../../../types";

// Define the structure of the Order document
export interface OrderDataType extends Document {
	publicId: string;
	createdAt: Date;
	updatedAt: Date;
	type: "food" | "package";
	userId: string;
	typeId: string;
	dropOffDetails: {
		name: string;
		phone: string;
		email: string;
		address: AddressType;
	};
	/*	pickupDetails: {
		name: string;
		phone: string;
		email: string;
		address: AddressType;
	};
	deliveryMode?: "Motorcycle" | "Tricycle" | "Bicycle" | "Foot";
	cashPaymentLocation: "Pick-up" | "Delivery";
	cashAvailable: { available: boolean; amount: number };
	*/
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
	dropOffDetails: {
		name: { type: String, required: true },
		phoneNumber: { type: String, required: true },
		email: { type: String, required: false },
		address: { type: Object, required: true }, // Using AddressType
	},
	/*


pickupDetails: {
		name: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: true },
		address: { type: Object, required: true },
	},
	deliveryMode: {
		type: String,
		enum: ["Motorcycle", "Tricycle", "Bicycle", "Foot"],
		required: true,
	},

	cashPaymentLocation: {
		type: String,
		enum: ["Pick-up", "Delivery"],
		required: true,
	},
	cashAvailable: {
		available: { type: Boolean, default: false },
		amount: { type: Number, default: 0 },
	},
	*/
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
