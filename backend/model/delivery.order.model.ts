import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

export interface DeliveryOrderDataType extends Document {
   publicId: string;
   createdAt: Date;
   updatedAt: Date;
}

const deliverySchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: () => nanoid(16),
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

export const DeliveryOrderSchema: Schema = new Schema(deliverySchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

// Pre save middleware to auto-generate slug

class DeliveryOrderModel extends mongoose.model<DeliveryOrderDataType>("delivery_order", DeliveryOrderSchema) {
}

export default DeliveryOrderModel;
