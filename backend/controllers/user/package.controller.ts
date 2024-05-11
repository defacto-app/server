import { Request, Response } from "express";
import { AuthDataType } from "../../auth/model";
import PackageModel, { PackageDataType } from "../../model/package.model";
import SendResponse from "../../libs/response-helper";

const PackageController = {
   async all(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as AuthDataType;

      try {
         const packages = await PackageModel.find({
            userId: user.publicId,
         });

         res.json({
            message: "Packages retrieved successfully.",
            success: true,
            packages,
            timestamp: new Date(),
         });
      } catch (error: any) {
         res.status(500).send("Error Fetching  order: " + error.message);
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
      const data = res.locals.packageItem as PackageDataType;

      // update the package

      await PackageModel.findOneAndUpdate(
         { publicId: data.publicId },
         req.body
      );

      try {


         SendResponse.success(res, "Package delivery updated successfully.", data);
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
