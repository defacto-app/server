import mongoose, { Document, Schema } from "mongoose";

export interface AddressDataType extends Document {
   label: string;
   address: string;
   location: string;
   coordinates: {
      lat: number;
      lng: number;
   };
}

const addressSchemaDefinitions = {
   label: {
      type: String,
      required: false,
      default: "home",
   },
   address: {
      type: String,
      required: true,
   },
   location: {
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
   AddressSchema
) {
   // set random email if email field is not provided
}

export default AddressModel;
