import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface AuthDataType extends Document {
   publicId: string;
   provider: "email" | "phone" | "google" | any;
   role: string;
   is_super_admin: null;
   banned_until: null;
   banned?: {
      until: null;
      reason: null;
      at: null;
   };

   password?: string;
   email: string;
   email_management: {
      login: {
         token?: string;
         expires_at?: null | Date;
         sent_at?: null | Date;
         confirmed_at: null | Date;
      };

      verified: boolean;
      reset:
         | {
              token: string | undefined;
              expires_at: Date | undefined;
              reset_at: Date | undefined;
              sent_at: Date;
           }
         | any;
   };

   phoneNumber: string | null | undefined;
   phone_management: {
      login:
         | {
              firstTime: boolean;
              otp: string;
              expires_at: Date;
              sent_at: Date;
           }
         | any;
      verified?: boolean;
      phone_confirmed_at?: null;
      phone_change?: string;
      phone_change_token?: string;
      phone_change_sent_at?: null;
   };
   joinedAt: Date | null;
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
      minLength: 11,
      maxLength: 15,
      sparse: true, // Make the index sparse
      unique: true,
   },
   phone_management: {
      login: {
         confirmed_at: {
            type: Date,
            required: false,
         },
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
         },
      },
      verified: {
         type: Boolean,
         required: false,
      },
   },
   email_management: {
      login: {
         token: {
            type: String,
            required: false,
         },
         expires_at: {
            type: Date,
            required: false,
         },
         sent_at: {
            type: Date,
            required: false,
         },
         confirmed_at: {
            type: Date,
            required: false,
         },
      },

      verified: {
         type: Boolean,
         required: false,
         default: false,
      },
      email_confirmed_at: {
         type: Date,
         required: false,
      },
      reset: {
         token: {
            type: String,
            required: false,
         },
         expires_at: {
            type: Date,
            required: false,
         },
         sent_at: {
            type: Date,
            required: false,
         },
      },
   },

   email: {
      type: String,
      unique: true,
      sparse: true, // Ensure this index is sparse too
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
      default: Date.now,
   },
};

export const AuthSchema: Schema = new Schema(authSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

class AuthModel extends mongoose.model<AuthDataType>("auth", AuthSchema) {
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
