import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { AddressType } from "../../types";

export interface OrderDataType extends Document {
   publicId: string;
   createdAt: Date;
   updatedAt: Date;
   type: "food" | "package" | "other";
   typeId: string;
   dropOffDetails: {
      name: string;
      phone: string;
      email: string;
      address: AddressType;
   };
   pickupDetails: {
      name: string;
      phone: string;
      email: string;
      address: AddressType;
   };
   charge: number;
   status: "pending" | "completed" | "cancelled";
   pickupTime: Date | null;
   assignedTo: string;
   isInstant: boolean | null;
   deliveryMode: "Motorcycle" | "Tricycle" | "Bicycle" | "Foot";
   description: string;
   cashPaymentLocation: "Pick-up" | "Delivery";
   cashAvailable: { available: boolean; amount: number };
   packageContent: string[];

}

const orderSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: uuidv4,
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
};

export const OrderSchema: Schema = new Schema(orderSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

// Pre save middleware to auto-generate slug

class OrderModel extends mongoose.model<OrderDataType>("orders", OrderSchema) {}

export default OrderModel;
