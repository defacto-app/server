import { Request, Response } from "express";
import { AuthDataType } from "../../model/auth.model";
import PackageModel, { PackageDataType } from "../../model/package.model";

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
         // Send the updated user back to the client
         res.json({
            message: "Package delivery scheduled successfully.",
            success: true,
            packageId: newPackage.publicId,
            timestamp: new Date(),
         });
      } catch (error: any) {
         // Handle possible errors
         res.status(500).send("Error Creating  order: " + error.message);
      }
   },

   async one(req: Request, res: Response): Promise<void> {
      const data = res.locals.packageItem as any;

      try {
         res.json({
            message: "Package retrieved",
            success: true,
            data,
            timestamp: new Date(),
         });
      } catch (error: any) {
         res.status(500).send("Error Fetching  package: " + error.message);
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
         res.json({
            message: "Package delivery updated successfully.",
            success: true,
            data,
            timestamp: new Date(),
         });
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
            message: "Package delivery deleted successfully.",
            success: true,
            timestamp: new Date(),
         });
      } catch (error: any) {
         res.status(500).send("Error Deleting  order: " + error.message);
      }
   },
};

export default PackageController;
