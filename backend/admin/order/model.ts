import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { AddressType } from "../../../types";

export const STATUS_VALUES = [
	"pending",
	"completed",
	"cancelled",
	"in-progress",
] as const;
export type StatusType = (typeof STATUS_VALUES)[number];
// Generate a simple orderId for users (e.g., "DFT-123456")
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
	note?: string;
	restaurantId?: string;
	package_image?: string;
	restaurant_image?: string;
	restaurant_name: string;
	dropOffDetails: {
		name: string;
		phone: string;
		email: string;
		address: AddressType;
	};
	pickupDetails: {
		name: string;
		phone?: string;
		email: string;
		address: AddressType;
	};

	paymentStatus: "pending" | "paid" | "failed" | "refunded";
	charge: number;
	status: StatusType;
	pickupTime: Date | null;
	assignedTo: string;
	isInstant: boolean | null;
	description: string;
	totalAmount: number;
	packageContent?: string[];
	menuItems?: { name: string; quantity: number; price: number }[];
	deliveredAt?: Date;
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

	restaurant_name: {
		type: String,
		required: false,
	},

	restaurant_image: {
		type: String,
		required: false,
	},

	orderId: {
		type: String,
		required: true,
		unique: true,
		default: generateOrderId, // Custom function to generate a user-friendly orderId
	},

	paymentStatus: {
		type: String,
		enum: ["pending", "paid", "failed", "refunded"],
		default: "pending",
	},

	trackingHistory: [
		{
			status: String,
			timestamp: Date,
			note: String,
		},
	],
	type: {
		type: String,
		required: true,
		enum: ["food", "package"],
	},
	pickupDetails: {
		name: { type: String, required: true },
		phone: { type: String, required: false },
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
	restaurantId: {
		type: String,
		required: false,
	},
	status: {
		type: String,
		enum: STATUS_VALUES,
		default: "pending" as StatusType,
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
	packageContent: [{ type: String, required: false, default: undefined }],
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
	deliveredAt: {
		type: Date,
		required: false,
	},
	note: {
		type: String,
		required: false,
	},
};

// Define the schema and apply timestamps for automatic tracking of createdAt and updatedAt
export const OrderSchema: Schema = new Schema(orderSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: false,
});

// Add order total calculation
OrderSchema.virtual("totalAmount").get(function (this: OrderDataType) {
	const itemsTotal = (this.menuItems ?? []).reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	return itemsTotal + this.charge;
});

// Create a Mongoose model for the Order based on the schema
const OrderModel = mongoose.model<OrderDataType>("orders", OrderSchema);

export default OrderModel;
