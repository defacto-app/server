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
   dropOffDetails: {
      type: Object,
      required: true,
   },
   pickupDetails: {
      type: Object,
      required: true,
   },
   charge: {
      type: Number,
      required: true,
   },
   status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
   },
   pickupTime: {
      type: Date,
      required: false,
      default: null,
   },
   assignedTo: {
      type: String,
      required: false,
      default: "",
   },
   isInstant: {
      type: Boolean,
      required: false,
      default: null,
   },
   deliveryId: {
      type: String,
      required: true,
   },
   description: {
      type: String,
      required: true,
   },
   cashPaymentLocation: {
      type: String,
      required: true,
      enum: ["Pick-up", "Delivery"],
   },
   cashAvailable: {
      available: { type: Boolean, required: true },
      amount: { type: Number, required: true },
   },
   packageContent: {
      type: [String],
      required: true,
   },
};

export const PackageSchema: Schema = new Schema(packageSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

const PackageModel = mongoose.model<PackageDataType>("Package", PackageSchema);

export default PackageModel;
