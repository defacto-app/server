import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";

export interface TeamDataType extends Document {
   publicId: string;
   title: string;
   summary: string;
   position: string;
   image: string;
   tags: string[];
   skills: string[];
   fullName: string;
   createdAt: Date;
   updatedAt: Date;
   enabled: boolean;
   category: string;
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
   fullName: {
      type: String,
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

export const TeamsSchema: Schema = new Schema(servicesSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

// Pre save middleware to auto-generate slug

class TeamsModel extends mongoose.model<TeamDataType>("team", TeamsSchema) {}

export default TeamsModel;
