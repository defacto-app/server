import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

export interface TestimonialDataType extends Document {
   publicId: string;
   name: string;
   description: string;
   image: string;
   company: string;
   tags: string[];
   category: string[];
   createdAt: Date;
   updatedAt: Date;
   enabled: boolean;
}

const testimonialSchemaDefinitions = {
   publicId: {
      type: String,
      required: true,
      default: () => nanoid(16),
      unique: true,
      minLength: 1,
      maxLength: 255,
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

export const TestimonialSchema: Schema = new Schema(
   testimonialSchemaDefinitions,
   {
      timestamps: true,
      versionKey: false,
      strict: false,
   }
);

// Pre save middleware to auto-generate slug

class TestimonialModel extends mongoose.model<TestimonialDataType>(
   "testimonial",
   TestimonialSchema
) {}

export default TestimonialModel;
