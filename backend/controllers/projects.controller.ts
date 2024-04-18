import { Request, Response } from "express";
import ProjectsModel from "../model/projects.model";
import Chance from "chance";
import { formatPathForStorage } from "../utils/utils";
import FileModel from "../model/files.model";
import moment from "moment";

const chance = new Chance();
// Define an interface or type if needed
interface SearchCondition {
   title?: RegExp;
   enabled?: any; // Use 'any' if the schema is not strict or you are not using TypeScript types for mongoose models
}


const ProjectController = {
   async all(req: Request, res: Response): Promise<void> {
      try {
         const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.limit as string) || 50;
         const searchString = (req.query.searchString as string) || "";

         // Initialize the search condition to exclude items with enabled:false

         let searchCondition: SearchCondition | any = { enabled: { $ne: false } };
         // If there's a search string, add the title search condition
         if (searchString) {
            // Combine the conditions using $and operator to ensure both conditions are met
            searchCondition = {
               $and: [
                  { title: new RegExp(searchString, "i") }, // 'i' flag for case-insensitive search
                  { enabled: { $ne: false } }
               ]
            };
         }

         const totalCount = await ProjectsModel.countDocuments(searchCondition);
         const skip = (page - 1) * limit;

         const data = await ProjectsModel.find(
             searchCondition, // Using the updated search condition
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
         const project = res.locals.project as any;

         console.log(project,"project");

         // add client information

         res.status(200).json(project);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default ProjectController;
