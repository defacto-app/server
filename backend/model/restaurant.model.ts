import mongoose, { type Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

export interface RestaurantOrderDataType extends Document {
	publicId: string;
	createdAt: Date;
	updatedAt: Date;
}

const restaurantSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: () => nanoid(16),
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
};

export const RestaurantOrderSchema: Schema = new Schema(
	restaurantSchemaDefinitions,
	{
		timestamps: true,
		versionKey: false,
		strict: false,
	},
);

// Pre save middleware to auto-generate slug

class RestaurantOrderModel extends mongoose.model<RestaurantOrderDataType>(
	"restaurant_order",
	RestaurantOrderSchema,
) {}

export default RestaurantOrderModel;
