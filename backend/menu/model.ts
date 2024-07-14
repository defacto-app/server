import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface MenuItemDataType extends Document {
	publicId: string;
	name: string;
	price: number;
	description: string;
	image: string;
	restaurantId: string;
	createdAt: Date;
	updatedAt: Date;
}

const menuItemSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: uuidv4,
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
	price: {
		type: Number,
		required: true,
		min: 0,
	},
	description: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	restaurantId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Restaurant",
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

export const MenuItemSchema: Schema = new Schema(menuItemSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: false,
});

class MenuItemModel extends mongoose.model<MenuItemDataType>(
	"menuItems",
	MenuItemSchema,
) {}

export default MenuItemModel;
