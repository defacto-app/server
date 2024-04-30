import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

interface UserDataType extends Document {
   instance_id: string;
   id: string;
   role: string;
   encrypted_password: string;
   is_super_admin: null;
   banned_until: null;
   timestamps: {
      created_at: string;
      updated_at: string;
      last_sign_in_at: null;
      email_confirmed_at: null;
      invited_at: null;
      confirmed_at: null;
      deleted_at: null;
   };
   password: string;
   email: string;
   email_management: {
      email: string;
      email_change: string;
      email_change_token_new: string;
      email_change_token_current: string;
      email_change_confirm_status: number;
      email_change_sent_at: null;
      confirmation_token: string;
      confirmation_sent_at: string;
   };

   recovery: {
      recovery_token: string;
      recovery_sent_at: null;
      reauthentication_token: string;
      reauthentication_sent_at: null;
   };

   phone:{
      extension: string;
      phone: string;
      country_code: string;
   }
   phone_management: {
      phone: null;
      phone_confirmed_at: null;
      phone_change: string;
      phone_change_token: string;
      phone_change_sent_at: null;
   };
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
   strict: false,
});


class UserModel extends mongoose.model<UserDataType>("user", UserSchema) {
   static async comparePassword(
      password: string,
      userPassword: string,
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
