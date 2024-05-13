import { NextFunction, Request, Response } from "express";
import PackageModel from "../../model/package.model";
import SendResponse from "../../libs/response-helper";

class PackageMiddleware {
   public async packageId(req: Request, res: Response, next: NextFunction) {
      const user = res.locals.user as any;
      const packageId = req.params.packageId;

      try {
         if (!packageId) {
            return res.status(400).json({ error: "Package id is required" });
         }

         // Execute the query
         const pkg = await PackageModel.findOne({
            publicId: packageId,
            userId: user.publicId,
         });

         if (!pkg) {
            SendResponse.notFound(
               res,
               `Sorry, package  ${packageId} is deleted or doesnt exist `
            );
         }

         res.locals.packageItem = pkg;

         next();
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   }

   public async userPackages(req: Request, res: Response, next: NextFunction) {
      const user = res.locals.user as any;

      try {
         // Execute the query
         const packages = await PackageModel.find(
            {
               userId: user.publicId,
            },
            {
               publicId: 1,
               packageName: 1,
               packageDescription: 1,
               packagePrice: 1,
               packageDuration: 1,
               packageStatus: 1,
               createdAt: 1,
               updatedAt: 1,
            }
         );
         // userId: user.userId,
         console.log("userpackageMiddleware", packages);
         // console.log("useruseruser", user);
         res.locals.packages = packages;

         next();
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   }
}

export default new PackageMiddleware();
