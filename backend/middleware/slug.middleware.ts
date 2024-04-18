import { NextFunction, Request, Response } from "express";

import ProjectsModel from "../model/projects.model";
import ServicesModel from "../model/services.model";
import TestimonialModel from "../model/testimonial.model";
import TeamsModel from "../model/teams.model";

class SlugMiddleware {
   public async projectSlug(req: Request, res: Response, next: NextFunction) {
      try {
         const slug = req.params.slug;

         if (!slug) {
            return res.status(400).json({ error: "Project  is required" });
         }

         // Execute the query
         const project = await ProjectsModel.findOne({
            slug: slug,
         });

         if (!project) {
            return res.status(404).json({
               message: `Sorry, project is deleted or doesnt exist  ${slug}`,
            });
         }

         res.locals.project = project;

         next();
      } catch (error: any) {
         return res.status(400).json({ error: error.message });
      }
   }
   public async serviceSlug(req: Request, res: Response, next: NextFunction) {
      try {
         const slug = req.params.slug;

         if (!slug) {
            return res.status(400).json({ error: "Service  is required" });
         }

         // Execute the query
         const service = await ServicesModel.findOne({
            slug: slug,
         });

         if (!service) {
            return res.status(404).json({
               message: `Sorry, service is deleted or doesnt exist  ${slug}`,
            });
         }

         res.locals.service = service;

         next();
      } catch (error: any) {
         return res.status(400).json({ error: error.message });
      }
   }
   public async testimonyPublicId(
      req: Request,
      res: Response,
      next: NextFunction
   ) {
      try {
         const publicId = req.params.publicId;

         if (!publicId) {
            return res.status(400).json({ error: "Testimony  is required" });
         }

         // Execute the query
         const testimony = await TestimonialModel.findOne({
            publicId: publicId,
         });

         if (!testimony) {
            return res.status(404).json({
               message: `Sorry, Testimony is deleted or doesnt exist  ${publicId}`,
            });
         }

         res.locals.testimony = testimony;

         next();
      } catch (error: any) {
         return res.status(400).json({ error: error.message });
      }
   }
   public async teamPublicId(req: Request, res: Response, next: NextFunction) {
      try {
         const publicId = req.params.publicId;

         if (!publicId) {
            return res.status(400).json({ error: "Testimony  is required" });
         }

         // Execute the query
         const data = await TeamsModel.findOne({
            publicId: publicId,
         });

         if (!data) {
            return res.status(404).json({
               message: `Sorry, Team is deleted or doesnt exist  ${publicId}`,
            });
         }

         res.locals.team = data;

         next();
      } catch (error: any) {
         return res.status(400).json({ error: error.message });
      }
   }
}

export default new SlugMiddleware();
