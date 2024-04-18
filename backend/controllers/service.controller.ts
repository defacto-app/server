import { Request, Response } from "express";
import ServicesModel from "../model/services.model";

const ServiceController = {
   async all(req: Request, res: Response): Promise<void> {
      const allServices = await ServicesModel.find({});

      try {
         res.status(200).json(allServices);
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
};

export default ServiceController;
