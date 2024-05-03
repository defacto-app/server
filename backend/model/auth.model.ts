import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface AuthDataType extends Document {
   instance_id: string;
   publicId: string;
   provider: "email" | "phone" | "google";
   role: string;
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
   password?: string;
   email: string;
   email_management: {
      otp?: string;
      otp_expires_at?: null | Date;
      otp_sent_at?: null | Date;
      verified?: boolean;
      email_confirmed_at?: null | Date;
   };

   recovery: {
      recovery_token: string;
      recovery_sent_at: null;
      reauthentication_token: string;
      reauthentication_sent_at: null;
   };

   phoneNumber: string;
   phone_management: {
      login: {
         firstTime: boolean;
         otp: string;
         expires_at: Date;
         sent_at: Date;
      };

      verified?: boolean;
      phone_confirmed_at?: null;
      phone_change?: string;
      phone_change_token?: string;
      phone_change_sent_at?: null;
   };
   joinedAt: Date;
   lastSeenAt: Date | null;
   bannedAt: Date | null;
   bannedReason: string | null;
   bannedUntil: Date | null;
   isBanned: boolean;

}

const authSchemaDefinitions = {
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
   phoneNumber: {
      type: String,
      required: false,
      minLength: 6,
      maxLength: 15,
      unique: true,
   },
   phone_management: {
      login: {
         otp: {
            type: String,
            required: false,
            minLength: 6,
            maxLength: 6,
         },
         expires_at: {
            type: Date,
            required: false,
         },
         sent_at: {
            type: Date,
            required: false,
         },
         firstTime: {
            type: Boolean,
            required: false,
         }
      },
      verified: {
         type: Boolean,
         required: false,
      },
   },
   email: {
      type: String,
      required: false,
      minLength: 1,
      maxLength: 255,
      unique: true,
   },
   password: {
      type: String,
      required: false,
      minLength: 1,
      maxLength: 255,
   },
   lastSeenAt: {
      type: Date,
   },
   joinedAt: {
      type: Date,
      required: false,
   },
}


export const AuthSchema: Schema = new Schema(authSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

/*
AuthSchema.index(
   { email: 1 },
   { unique: true, partialFilterExpression: { email: { $exists: true } } },
);
*/

class AuthModel extends mongoose.model<AuthDataType>("auth", AuthSchema) {
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

   static async hashPassword(password: string): Promise<string> {
      return new Promise((resolve, reject) => {
         bcrypt.hash(password, 10, (err: any, hash: any) => {
            if (err) reject(err);
            else resolve(hash);
         });
      });
   }
}

export default AuthModel;
