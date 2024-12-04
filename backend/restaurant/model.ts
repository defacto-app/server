import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import type { AddressType } from "../../types";

export interface RestaurantDataType extends Document {
	publicId: string;
	name: string;
	slug: string;
	deliveryTime: string;
	category: string;
	image: string;
	logo: string;

	address: AddressType;

	phone: string;
	email: string;
	discount?: number;
	openingHours: {
		monday: { open: string; close: string; isClosed: boolean };
		tuesday: { open: string; close: string; isClosed: boolean };
		wednesday: { open: string; close: string; isClosed: boolean };
		thursday: { open: string; close: string; isClosed: boolean };
		friday: { open: string; close: string; isClosed: boolean };
		saturday: { open: string; close: string; isClosed: boolean };
		sunday: { open: string; close: string; isClosed: boolean };
	};
	createdAt: Date;
	updatedAt: Date;
	isCurrentlyOpen(): boolean;
}

const timeValidator = {
	validator: (v: string) => {
		// Validates time in 24-hour format (HH:mm)
		return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
	},
	message: "Time must be in 24-hour format (HH:mm)",
};

const openingHoursSchema = {
	open: {
		type: String,
		required: true,
		validate: timeValidator,
	},
	close: {
		type: String,
		required: true,
		validate: timeValidator,
	},
	isClosed: {
		type: Boolean,
		default: false,
	},
};

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
	openingHours: {
		monday: openingHoursSchema,
		tuesday: openingHoursSchema,
		wednesday: openingHoursSchema,
		thursday: openingHoursSchema,
		friday: openingHoursSchema,
		saturday: openingHoursSchema,
		sunday: openingHoursSchema,
	},
	name: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	deliveryTime: {
		type: String,
		required: false,
		default: "30-45 mins",
	},
	category: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	logo: {
		type: String,
		required: false,
		default: "https://placehold.co/600x400.png",
	},
	image: {
		type: String,
		required: false,
		default: "https://placehold.co/600x400.png",
	},
	address: {
		type: Object,
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

// Method to check if restaurant is currently open
RestaurantSchema.methods.isCurrentlyOpen = function (): boolean {
	const now = new Date();
	// Get day name and convert to lowercase
	const currentDay = now
		.toLocaleDateString("en-US", { weekday: "long" })
		.toLowerCase();
	const currentTime = now.toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
	});

	const todayHours = this.openingHours[currentDay];

	if (!todayHours || todayHours.isClosed) {
		return false;
	}

	const openTime = todayHours.open;
	const closeTime = todayHours.close;

	// Handle cases where closing time is after midnight
	if (closeTime < openTime) {
		return currentTime >= openTime || currentTime <= closeTime;
	}

	return currentTime >= openTime && currentTime <= closeTime;
};

// Pre-save middleware to auto-generate slug
RestaurantSchema.pre<RestaurantDataType>("save", async function (next) {
	if (!this.isModified("name")) {
		return next();
	}

	let generatedSlug = slugify(this.name, { lower: true, strict: true });
	const existingRestaurant = await RestaurantModel.findOne({
		slug: generatedSlug,
	});

	if (existingRestaurant) {
		const randomString = uuidv4().slice(0, 6);
		generatedSlug = `${generatedSlug}-${randomString}`;
	}

	this.slug = generatedSlug;
	next();
});

const RestaurantModel = mongoose.model<RestaurantDataType>(
	"restaurants",
	RestaurantSchema,
);

export default RestaurantModel;
