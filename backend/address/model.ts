import mongoose, { Document, Schema } from "mongoose";

export interface AddressDataType extends Document {}

const addressSchemaDefinitions = {};

export const AddressSchema: Schema = new Schema(addressSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

class AddressModel extends mongoose.model<AddressDataType>(
   "address",
   AddressSchema
) {
   // set random email if email field is not provided
}

export default AddressModel;
