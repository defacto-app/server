import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface UserDataType extends Document {
   email: string;
   lastSeenAt: Date;
   joinedAt: Date;
   firstName: string;
   phoneNumber: string;
   address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      lat: number;
      lng: number;
   };
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
   email: {
      type: String,
      required: true,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
};

export const UserSchema: Schema = new Schema(userSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

class UserModel extends mongoose.model<UserDataType>("user", UserSchema) {}

export default UserModel;
