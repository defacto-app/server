import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
export interface RestaurantDataType extends Document {
	publicId: string;
	name: string;
	slug: string;
	rating: number;
	deliveryTime: string;
	category: string;
	image: string;
	address: string;
	phone: string;
	email: string;
	openingHours: string;
	menuItems: { name: string; price: number }[];
	createdAt: Date;
	updatedAt: Date;
}

const restaurantSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: uuidv4,
		unique: true,
		minLength: 1,
		maxLength: 255,
	},
	slug: {
		type: String,
		required: false,
		unique: true,
		minLength: 1,
		maxLength: 255,
	},
	name: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	rating: {
		type: Number,
		required: true,
		min: 0,
		max: 5,
	},
	deliveryTime: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	image: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	openingHours: {
		type: String,
		required: true,
	},
	menuItems: [
		{
			name: {
				type: String,
				required: true,
			},
			price: {
				type: Number,
				required: true,
			},
		},
	],
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

export const RestaurantSchema: Schema = new Schema(
	restaurantSchemaDefinitions,
	{
		timestamps: true,
		versionKey: false,
		strict: false,
	},
);

// Pre save middleware to auto-generate slug

// Pre-save middleware to auto-generate slug
// Pre-save middleware to auto-generate slug

const RestaurantModel = mongoose.model<RestaurantDataType>("restaurants", RestaurantSchema);

export default RestaurantModel;
