import { Request, Response } from "express";
import Chance from "chance";
import moment from "moment";
import ProjectsModel from "../../model/projects.model";
import FileModel from "../../model/files.model";
import { formatPathForStorage } from "../../utils/utils";
import TeamsModel from "../../model/teams.model";
import ServicesModel from "../../model/services.model";
import TestimonialModel from "../../model/testimonial.model";

const chance = new Chance();

const DashboardController = {
   async all(req: Request, res: Response): Promise<void> {
      try {
         const countOperations = [
            ProjectsModel.countDocuments(),
            TeamsModel.countDocuments(),
            ServicesModel.countDocuments(),
            TestimonialModel.countDocuments()
         ];

         // Await all promises to be resolved
         const [totalProjects, totalTeams, totalServices, totalTestimonials] = await Promise.all(countOperations);

         const summary = [
          { label: "Projects", value: totalProjects },
           { label: "Teams", value: totalTeams },
            { label: "Services", value: totalServices },
            { label: "Testimonials", value: totalTestimonials },
         ];


         res.status(200).json({
            data: summary,
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default DashboardController;
