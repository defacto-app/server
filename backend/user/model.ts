import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { AddressType } from "../../types";

export interface UserDataType extends Document {
   email: string;
   lastSeenAt: Date;
   joinedAt: Date;
   firstName: string;
   role: string;
   phoneNumber: string;
   random_email?: boolean;
   address?: AddressType;
   userId: string;
   random_number?: boolean;
}

const userSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: uuidv4,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
   },

   address: {
      type: Object,
      required: false,
      default: {},
   },

   firstName: {
      type: String,
      required: false,
      default: "",
      minLength: 0,
      maxLength: 255,
   },
   email: {
      type: String,
      unique: true,
      sparse: true, // Ensure this index is sparse too
   },
   phoneNumber: {
      type: String,
      minLength: 11,
      maxLength: 15,
      sparse: true, // Make the index sparse
      unique: true,
   },
   userId: {
      type: String,
      required: true,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },

   joinedAt: {
      type: Date,
      required: true,
   },
   random_email: {
      type: Boolean,
      required: false,
   },
};

export const UserSchema: Schema = new Schema(userSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

class UserModel extends mongoose.model<UserDataType>("user", UserSchema) {
   // set random email if email field is not provided
}

export default UserModel;
