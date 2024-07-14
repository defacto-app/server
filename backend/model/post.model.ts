import mongoose, { type Document, Schema } from "mongoose";
import { nanoid } from "nanoid";
import { generateSlug } from "../utils/utils";
import moment from "moment";

export interface BasePostDataType extends Document {
	publicId: string;
	title: string;
	description: string;
	image: string[] | string;
	tags: string[];
	category: string[];
	createdAt: Date;
	updatedAt: Date;
	enabled: boolean;
	parent: string;
	slug: string;
}

const BasePostSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: () => nanoid(16),
		unique: true,
		minLength: 1,
		maxLength: 255,
	},

	enabled: {
		type: Boolean,
		required: true,
		default: true,
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

export const BasePostSchema: Schema = new Schema(BasePostSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: false,
});

// Pre save middleware to auto-generate slug

class PostModel extends mongoose.model<BasePostDataType>(
	"BasePost",
	BasePostSchema,
) {}

export default PostModel;
