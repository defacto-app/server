import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";
import { generateSlug } from "../utils/utils";

export interface ServicesDataType extends Document {
   publicId: string;
   slug: string;
   title: string;
   description: string;

   tags: string[];
   createdAt: Date;
   updatedAt: Date;
   enabled: boolean;
   category: string;
   projectUrl: string;
}

const servicesSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: () => nanoid(16),
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   slug: {
      type: String,
      required: false,
      unique: true,
      minLength: 1,
      maxLength: 255,
   },
   title: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
   },

   description: {
      type: String,
      required: true,
   },
   category: {
      type: String,
      required: false,
   },
   projectUrl: {
      type: String,
      required: false,
   },
   tags: {
      type: Array,
      required: false,
   },
   enabled: {
      type: Boolean,
      required: true,
      default: true,
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

export const ServicesSchema: Schema = new Schema(servicesSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

// Pre save middleware to auto-generate slug

ServicesSchema.pre<ServicesDataType>("save", function (next) {
   if (this.title && !this.slug) {
      this.slug = generateSlug(this.title);
   }
   next();
});

class ServicesModel extends mongoose.model<ServicesDataType>(
   "services",
   ServicesSchema
) {}

export default ServicesModel;
