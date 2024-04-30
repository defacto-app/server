import mongoose, { Document, Schema } from "mongoose";
import { RawAppMetaData, RawUserMetaData } from "../../types";

interface SupabaseUserType extends Document {
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
   email: {
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

   phone: {
      phone: null;
      phone_confirmed_at: null;
      phone_change: string;
      phone_change_token: string;
      phone_change_sent_at: null;
   };
}

const userSchemaDefinitions = {};

export const UserSchema: Schema = new Schema(userSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

class UserModel extends mongoose.model<SupabaseUserType>("user", UserSchema) {}

export default UserModel;
