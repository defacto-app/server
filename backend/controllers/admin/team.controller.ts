import { Request, Response } from "express";
import Chance from "chance";
import moment from "moment";

import FileModel from "../../model/files.model";
import { formatPathForStorage } from "../../utils/utils";
import TeamsModel from "../../model/teams.model";

const chance = new Chance();

const TeamController = {
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
               { fullName: { $regex: escapedSearchString, $options: "i" } },
               { summary: { $regex: escapedSearchString, $options: "i" } },
            ],
         };

         const totalCount = await TeamsModel.countDocuments(searchCondition);

         const skip = (page - 1) * limit;

         const data = await TeamsModel.find(
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
         const team = res.locals.team as any;

         // add client information

         res.status(200).json(team);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async create(req: Request, res: Response): Promise<void> {
      try {
         const newTeam = new TeamsModel({
            fullName: chance.name(),
            summary: "Experienced team Member",
         });
         await newTeam.save();

         res.status(200).json({
            publicId: newTeam.publicId,
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
         const team = res.locals.team as any;

         await TeamsModel.updateOne(
            {
               publicId: team.publicId,
            },
            {
               $set: updateData, // Use updateData instead of req.body
            },
            {
               new: true,
            }
         );
         res.status(200).json({
            message: "Team member Updated",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async upload(req: Request, res: Response): Promise<void> {
      const team = res.locals.team as any;

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

         await TeamsModel.updateOne(
            {
               publicId: team.publicId,
            },
            {
               $set: {
                  image: newFile.path,
               },
            }
         );

         res.status(200).json({
            message: "Updated Team member image",
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
         const team = res.locals.team as any;

         await TeamsModel.deleteOne({
            publicId: team.publicId,
         });

         res.status(200).json({
            message: "Team member Deleted",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default TeamController;
