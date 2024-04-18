import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";
import { generateSlug } from "../utils/utils";
import moment from "moment";

export interface ProjectsDataType extends Document {
   publicId: string;
   slug: string;
   title: string;
   logo: string;
   year: string;
   tech: string;
   description: string;
   projectUrl: string;
   category: string[];
   tags: string[];
   createdAt: Date;
   updatedAt: Date;
   enabled: boolean;
}

const projectsSchemaDefinitions = {
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
      required: false,
      minLength: 1,
      maxLength: 255,
   },
   projectUrl: {
      type: String,
      required: false,
      minLength: 1,
      maxLength: 255,
   },

   year: {
      type: String,
      required: false,
      minLength: 1,
      maxLength: 255,
   },
   description: {
      type: String,
      required: true,
   },

   logo: {
      type: String,
      required: false,
   },
   tags: {
      type: Array,
      required: false,
      minLength: 1,
      maxLength: 255,
   },
   enabled: {
      type: Boolean,
      required: true,
      default: false,
   },
   category: {
      type: Array,
      required: true,
      minLength: 1,
      maxLength: 255,
   },
   completed: {
      type: Date,
      required: true,
      default: new Date(),
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

export const ProjectSchema: Schema = new Schema(projectsSchemaDefinitions, {
   timestamps: true,
   versionKey: false,
   strict: false,
});

// Pre save middleware to auto-generate slug
ProjectSchema.pre("save", function (next) {
   // Check if title is provided and slug is not
   if (this.title && !this.slug) {
      // @ts-ignore
      this.slug = generateSlug(this.title);
   } else {
      this.slug = generateSlug(
         `$${this.title}-${moment().format("YYYY-MM-DD HH-mm-ss")}`
      );
   }
   next();
});

class ProjectsModel extends mongoose.model<ProjectsDataType>(
   "projects",
   ProjectSchema
) {}

export default ProjectsModel;
