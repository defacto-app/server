import mongoose, { Document, Schema } from "mongoose";

import { dropOffDetailsType, pickupDetailsType } from "../../types";
import { nanoid } from "nanoid";

export interface PackageDataType extends Document {
   userId: string;
   publicId: string;
   createdAt: Date;
   updatedAt: Date;
   dropOffDetails: dropOffDetailsType;
   pickupDetails: pickupDetailsType;
   charge: number;
   status: "pending" | "completed" | "cancelled";
   pickupTime: Date | null;
   assignedTo: string;
   isInstant: boolean | null;
   deliveryId: string;
   description: string;
   cashPaymentLocation: "Pick-up" | "Delivery";
   cashAvailable: { available: boolean; amount: number };
   packageContent: string[];
}

const packageSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: () => nanoid(7),
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   createdAt: {
      type: Date,
      required: true,
      default: new Date(),
   },
   updatedAt: {
      type: Date,
      required: true,
      default: new Date(),
   },
   userId: {
      type: String,
      required: true,
      unique: false,
      minLength: 1,
      maxLength: 255,
   },
};

export const PackageSchema: Schema = new Schema(packageSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

class PackageModel extends mongoose.model<PackageDataType>(
   "packages",
   PackageSchema
) {}

export default PackageModel;
