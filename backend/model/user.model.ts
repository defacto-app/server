import bcrypt from "bcrypt";
import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

export interface UserDataType extends Document {
   publicId: string;
   email: string;
   password: string;
   role: "user" | "admin";
   lastSeenAt?: Date;
}
const userSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: () => nanoid(16),
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

   email: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
   },
   password: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
   },
   lastSeenAt: {
      type: Date,
   },
};
export const UserSchema: Schema = new Schema(userSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: true,
});

// Hash the password before saving the user model
UserSchema.pre<UserDataType>("save", async function (next) {
   if (!this.isModified("password")) return next();

   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);

   next();
});

class UserModel extends mongoose.model<UserDataType>("user", UserSchema) {
   static async comparePassword(
      password: string,
      userPassword: string
   ): Promise<boolean> {
      return new Promise((resolve, reject) => {
         bcrypt.compare(password, userPassword, (err: any, isMatch: any) => {
            if (err) reject(err);
            else resolve(isMatch);
         });
      });
   }
}
export default UserModel;
