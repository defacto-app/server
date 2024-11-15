import mongoose, { type Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// Interface for the document
export interface AuthDataType extends Document {
   publicId: string;
   provider: "email" | "phone" | "google" | string;
   role: "user" | "admin";
   is_super_admin?: boolean | null;
   banned_until?: Date | null;
   banned?: {
      until: Date | null;
      reason: string | null;
      at: Date | null;
   };
   password?: string;
   email?: string;
   email_management: {
      login?: {
         token?: string;
         expires_at?: Date | null;
         sent_at?: Date | null;
         confirmed_at?: Date | null;
      };
      verified: boolean;
      reset?: {
         token?: string;
         expires_at?: Date;
         reset_at?: Date;
         sent_at?: Date;
      };
   };
   phoneNumber?: string | null;
   phone_management: {
      login?: {
         firstTime?: boolean;
         otp?: string;
         expires_at?: Date;
         sent_at?: Date;
      };
      verified?: boolean;
      phone_confirmed_at?: Date | null;
      phone_change?: string;
      phone_change_token?: string;
      phone_change_sent_at?: Date | null;
   };
   joinedAt: Date | null;
   lastSeenAt?: Date;
   loginAttempts?: {
      count: number;
      lastAttempt: Date | null;
      lockedUntil: Date | null;
   };
}

// Schema definitions
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
      sparse: true,
      unique: true,
   },
   phone_management: {
      login: {
         otp: { type: String, minLength: 6, maxLength: 6 },
         expires_at: { type: Date },
         sent_at: { type: Date },
         firstTime: { type: Boolean },
      },
      verified: { type: Boolean, default: false },
   },
   email_management: {
      login: {
         token: { type: String },
         expires_at: { type: Date },
         sent_at: { type: Date },
         confirmed_at: { type: Date },
      },
      verified: { type: Boolean, default: false },
      reset: {
         token: { type: String },
         expires_at: { type: Date },
         sent_at: { type: Date },
      },
   },
   email: {
      type: String,
      unique: true,
      sparse: true,
   },
   password: {
      type: String,
      minLength: 1,
      maxLength: 255,
   },
   lastSeenAt: { type: Date },
   joinedAt: { type: Date, default: Date.now },
   loginAttempts: {
      count: { type: Number, default: 0 },
      lastAttempt: { type: Date },
      lockedUntil: { type: Date },
   },
};

// Create schema
const AuthSchema = new Schema(authSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
});

// Static methods
AuthSchema.statics.comparePassword = async (
   password: string,
   userPassword: string
): Promise<boolean> => bcrypt.compare(password, userPassword);

AuthSchema.statics.hashPassword = async (
   password: string
): Promise<string> => bcrypt.hash(password, 10);

// Instance methods
AuthSchema.methods.handleFailedLogin = async function () {
   const now = new Date();
   this.loginAttempts.count += 1;
   this.loginAttempts.lastAttempt = now;

   if (this.loginAttempts.count >= 5) {
      this.loginAttempts.lockedUntil = new Date(now.getTime() + 30 * 60 * 1000); // Lock for 30 mins
   }

   await this.save();
};

// Middleware for cleaning expired tokens
AuthSchema.pre("save", function (next) {
   const now = new Date();
   if (
      this.email_management?.login?.expires_at &&
      this.email_management.login.expires_at < now
   ) {
      this.email_management.login = undefined;
   }
   if (
      this.phone_management?.login?.expires_at &&
      this.phone_management.login.expires_at < now
   ) {
      this.phone_management.login = undefined;
   }
   next();
});

// Model creation
const AuthModel = mongoose.model<AuthDataType>("auth", AuthSchema);

export default AuthModel;
