import { Request, Response } from "express";
import Chance from "chance";
import moment from "moment";

import FileModel from "../../model/files.model";
import { formatPathForStorage } from "../../utils/utils";
import ServicesModel from "../../model/services.model";

const chance = new Chance();

const ServiceController = {
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
               { title: { $regex: escapedSearchString, $options: "i" } },
               { description: { $regex: escapedSearchString, $options: "i" } },
            ],
         };

         const totalCount = await ServicesModel.countDocuments(searchCondition);

         const skip = (page - 1) * limit;

         const data = await ServicesModel.find(
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
         const service = res.locals.service as any;

         // add client information

         res.status(200).json(service);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
   async create(req: Request, res: Response): Promise<void> {
      try {
         const newService = new ServicesModel({
            title: `anonymous service ${Date.now()}`,
            description: chance.paragraph(),
         });
         await newService.save();

         res.status(200).json({
            slug: newService.slug,
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
         const service = res.locals.service as any;

         await ServicesModel.updateOne(
            {
               slug: service.slug,
            },
            {
               $set: updateData, // Use updateData instead of req.body
            },
            {
               new: true,
            }
         );
         res.status(200).json({
            message: "Service Updated",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async upload(req: Request, res: Response): Promise<void> {
      const service = res.locals.service as any;

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

         await ServicesModel.updateOne(
            {
               publicId: service.publicId,
            },
            {
               $set: {
                  logo: newFile.path,
               },
            }
         );

         res.status(200).json({
            message: "Updated Post image",
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
         const service = res.locals.service as any;

         await ServicesModel.deleteOne({
            slug: service.slug,
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

export default ServiceController;
