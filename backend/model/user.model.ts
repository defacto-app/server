import mongoose, { Document, Schema } from "mongoose";
import { RawAppMetaData, RawUserMetaData } from "../../types";

export interface SupabaseUserType extends Document {
   instance_id: string;
   id: string;
   aud: string;
   role: string;
   email: string;
   encrypted_password: string;
   email_confirmed_at: null;
   invited_at: null;
   confirmation_token: string;
   confirmation_sent_at: string;
   recovery_token: string;
   recovery_sent_at: null;
   email_change_token_new: string;
   email_change: string;
   email_change_sent_at: null;
   last_sign_in_at: null;
   raw_app_meta_data: RawAppMetaData;
   raw_user_meta_data: RawUserMetaData;
   is_super_admin: null;
   created_at: string;
   updated_at: string;
   phone: null;
   phone_confirmed_at: null;
   phone_change: string;
   phone_change_token: string;
   phone_change_sent_at: null;
   confirmed_at: null;
   email_change_token_current: string;
   email_change_confirm_status: number;
   banned_until: null;
   reauthentication_token: string;
   reauthentication_sent_at: null;
   is_sso_user: boolean;
   deleted_at: null;
   is_anonymous: boolean;

}
const userSchemaDefinitions = {

};


export const UserSchema: Schema = new Schema(userSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});



class UserModel extends mongoose.model<SupabaseUserType>("user", UserSchema) {

}
export default UserModel;
