import { Request, Response } from "express";
import { AuthDataType } from "../../auth/model";
import PackageModel, { PackageDataType } from "../../model/package.model";
import SendResponse from "../../libs/response-helper";
import PackageValidator from "./validator";
import paginate from "../../utils/pagination";

const PackageController = {

   async  all(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as any;
    
      // Extract page and perPage from request query. Set default values if not provided.
      const page: number = parseInt(req.query.page as string) || 1;
      const perPage: number = parseInt(req.query.perPage as string) || 10;
     const query = { userId: user.userId };
      const projection = { cashAvailable: 0 }; // Exclude password field
      try {
        const paginationResult = await paginate(PackageModel, page, perPage, query, projection);
        
        res.json(paginationResult);

        SendResponse.success(res, "Packages retrieved", paginationResult);
      } catch (error:any) {

        SendResponse.serverError(res, error.message);
      }
    },


   async create(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as AuthDataType;

      const newPackage = new PackageModel({
         userId: user.publicId,
         ...req.body,
      });

      await newPackage.save();

      try {
         // Send the updated user back to the client\
         SendResponse.success(res, "Created New Package Delivery.", {
            packageId: newPackage.publicId,
         });
      } catch (error: any) {
         // Handle possible errors
         SendResponse.serverError(res, error.message);
      }
   },

   async one(req: Request, res: Response): Promise<void> {
      const data = res.locals.packageItem as any;

      try {
         SendResponse.success(res, "Package retrieved", data);
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },

   async update(req: Request, res: Response): Promise<void> {

      const { data:packageItem, error } = await PackageValidator.update(req.body);
      
      if (error) {
          SendResponse.validationError(res, error);
          return
      }

      const data = res.locals.packageItem as PackageDataType;

      console.log(packageItem);

      // update the package

      // await PackageModel.findOneAndUpdate(
      //    { publicId: data.publicId },
      //    ...packageItem,
      //    { new: true }
      // );

      try {
         SendResponse.success(
            res,
            "Package delivery updated successfully.",
            data
         );
      } catch (error: any) {
         res.status(500).send("Error Updating  order: " + error.message);
      }
   },

   async delete(req: Request, res: Response): Promise<void> {
      const data = res.locals.packageItem as PackageDataType;

      await PackageModel.findOneAndDelete({
         publicId: data.publicId,
      });

      try {
         res.json({
            message: "Package deleted.",
            success: true,
            timestamp: new Date(),
         });
      } catch (error: any) {
         res.status(500).send("Error Deleting  order: " + error.message);
      }
   },
};

export default PackageController;
