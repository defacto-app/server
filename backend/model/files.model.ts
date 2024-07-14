import mongoose, { type Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

const category_list = ["form", "company", "other"] as const;

export const label_list = [
	"projectImage",
	"identity",
	"companyLogo",
	"teamImage",
	"other",
	"cover",
] as const;

export type LabelType = (typeof label_list)[number];

export interface CategoryType {
	[index: number]: (typeof category_list)[number];
}

export interface FileDataType extends Document {
	publicId: string;
	filename: string;
	category: CategoryType;
	applicationId: number;
	originalname: string;
	destination: string;
	mimetype: string;
	path: string;
	encoding: string;
	deleted: boolean;
	size: number;
	uploadLabel: LabelType;
	lastSeenAt?: Date;
}

const fileSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: () => nanoid(16),
		unique: true,
		minLength: 1,
		maxLength: 255,
	},

	category: {
		type: [String],
		required: true,
		enum: category_list,
	},
	encoding: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	path: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	mimetype: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},

	originalname: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	filename: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 255,
	},

	applicationId: {
		type: Number,
		required: false,
		minLength: 1,
		maxLength: 255,
	},
	size: {
		type: Number,
		required: true,
		minLength: 1,
		maxLength: 255,
	},
	lastSeenAt: {
		type: Date,
	},

	deleted: {
		type: Boolean,
		default: false,
	},

	uploadLabel: {
		type: String,
		required: false,
		enum: label_list,
		minLength: 1,
		maxLength: 255,
	},
};
export const FileSchema: Schema = new Schema(fileSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: true,
});

// Hash the password before saving the user model

class FileModel extends mongoose.model<FileDataType>("file", FileSchema) {}

export default FileModel;
