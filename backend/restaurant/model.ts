import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

export interface RestaurantDataType extends Document {
	publicId: string;
	name: string;
	slug: string;
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
	image: {
		type: String,
		required: false,
		default: "https://placehold.co/600x400.png",
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

// Pre-save middleware to auto-generate slug
RestaurantSchema.pre<RestaurantDataType>('save', async function (next) {
	if (!this.isModified('name')) {
		return next();
	}

	// Generate a slug from the restaurant name
	let generatedSlug = slugify(this.name, { lower: true, strict: true });

	// Check if the slug already exists in the database
	const existingRestaurant = await RestaurantModel.findOne({ slug: generatedSlug });

	// If a restaurant with the same slug exists, append a random string to make it unique
	if (existingRestaurant) {
		const randomString = uuidv4().slice(0, 6); // Use part of the UUID to avoid duplicate slugs
		generatedSlug = `${generatedSlug}-${randomString}`;
	}

	this.slug = generatedSlug; // Assign the unique slug
	next();
});

const RestaurantModel = mongoose.model<RestaurantDataType>("restaurants", RestaurantSchema);

export default RestaurantModel;


