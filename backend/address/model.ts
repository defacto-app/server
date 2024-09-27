import mongoose, { type Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface AddressDataType extends Document {
	label: string;
	publicId: string;
	address: string;
	city: string;
	location: string;
	postalCode: string;
	coordinates: {
		lat: number;
		lng: number;
	};
}

const addressSchemaDefinitions = {
	publicId: {
		type: String,
		required: true,
		default: uuidv4,
		unique: true,
		minLength: 1,
		maxLength: 255,
	},
	label: {
		type: String,
		required: false,
		default: "home",
	},
	address: {
		type: String,
	},
	location: {
		type: String,
	},
	city: {
		type: String,
		required: true,
	},
	postalCode: {
		type: String,
	},
	country: {
		type: String,
		required: true,
	},
	coordinates: {
		type: Object,
		required: true,
		default: {},
	},
};

export const AddressSchema: Schema = new Schema(addressSchemaDefinitions, {
	timestamps: true,
	versionKey: false,
	strict: false,
});

class AddressModel extends mongoose.model<AddressDataType>(
	"address",
	AddressSchema,
) {
	// set random email if email field is not provided
}

export default AddressModel;
