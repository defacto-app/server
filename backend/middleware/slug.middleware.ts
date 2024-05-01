import { NextFunction, Request, Response } from "express";


import PackageModel from "../model/package.model";

class SlugMiddleware {
   public async packageId(req: Request, res: Response, next: NextFunction) {
      const user = res.locals.user as any;
      const packageId = req.params.packageId;

      try {

         if (!packageId) {
            return res.status(400).json({ error: "Service  is required" });
         }

         // Execute the query
         const pkg = await PackageModel.findOne({
            publicId: packageId ,
            userId: user.publicId,
         });

         if (!pkg) {
            return res.status(404).json({
               message: `Sorry, package  ${packageId} is deleted or doesnt exist `,
               timestamp: new Date(),
               success: false,
            });
         }

         res.locals.packageItem = pkg;

         next();
      } catch (error: any) {
         return res.status(400).json({ error: error.message });
      }
   }

}

export default new SlugMiddleware();
