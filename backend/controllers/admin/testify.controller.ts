import { Request, Response } from "express";
import Chance from "chance";
import moment from "moment";

import FileModel from "../../model/files.model";
import { formatPathForStorage } from "../../utils/utils";

import TestimonialModel from "../../model/testimonial.model";

const chance = new Chance();

const TestimonyController = {
   async all(req: Request, res: Response): Promise<void> {
      try {
         const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.limit as string) || 50;

         const searchString = (req.query.searchString as string) || "";

         const escapedSearchString = searchString.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
         );
         const searchCondition = {
            $or: [
               { name: { $regex: escapedSearchString, $options: "i" } },
               { description: { $regex: escapedSearchString, $options: "i" } },
            ],
         };

         const totalCount =
            await TestimonialModel.countDocuments(searchCondition);

         const skip = (page - 1) * limit;

         const data = await TestimonialModel.find(
            searchCondition, // Add search condition here
            {},
            {
               limit: limit,
               skip: skip,
            }
         );
         const lastPage = Math.ceil(totalCount / limit);
         const meta = {
            total: totalCount,
            perPage: limit,
            page: page,
            lastPage: lastPage,
         };
         res.status(200).json({
            meta: meta,
            data: data,
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async one(req: Request, res: Response): Promise<void> {
      try {
         const testimony = res.locals.testimony as any;

         // add client information

         res.status(200).json(testimony);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
   async create(req: Request, res: Response): Promise<void> {
      try {
         const newTestimony = new TestimonialModel({
            name: `satisfied customer ${Date.now()}`,
            description: chance.paragraph(),
         });
         await newTestimony.save();

         res.status(200).json({
            publicId: newTestimony.publicId,
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async update(req: Request, res: Response): Promise<void> {
      try {
         const { _id, publicId, ...updateData } = req.body;
         const testimony = res.locals.testimony as any;

         await TestimonialModel.updateOne(
            {
               publicId: testimony.publicId,
            },
            {
               $set: updateData, // Use updateData instead of req.body
            },
            {
               new: true,
            }
         );
         res.status(200).json({
            message: "Testimony Updated",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async upload(req: Request, res: Response): Promise<void> {
      const testimony = res.locals.testimony as any;

      const { uploadLabel } = req.query as any;

      try {
         if (!req.file) {
            res.status(400).json({
               message: "No file uploaded",
            });
            return;
         }

         const newFile = new FileModel({
            uploadLabel: uploadLabel,
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: formatPathForStorage(req.file.path),
            size: req.file.size,
            mimetype: req.file.mimetype,
            encoding: req.file.encoding,
         });

         await newFile.save();

         await TestimonialModel.updateOne(
            {
               publicId: testimony.publicId,
            },
            {
               $set: {
                  logo: newFile.path,
               },
            }
         );

         res.status(200).json({
            message: "Updated Testimony image",
            description: moment().format("h:mm:ss a"),
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async delete(req: Request, res: Response): Promise<void> {
      try {
         const testimony = res.locals.testimony as any;

         await TestimonialModel.deleteOne({
            publicId: testimony.publicId,
         });

         res.status(200).json({
            message: "service Deleted",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default TestimonyController;
