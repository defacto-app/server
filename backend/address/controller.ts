import { Request, Response } from "express";
import AddressModel from "./model";
import { AuthDataType } from "../auth/model";

const AddressController = {
   async all(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as any;

      console.log("Userallallall", user);

      try {
         const address = await AddressModel.find({
            userId: user.userId,
         });

         res.json({
            message: "Address retrieved successfully.",
            success: true,
            address,
            timestamp: new Date(),
         });
      } catch (error: any) {
         res.status(500).send("Error Fetching  order: " + error.message);
      }
   },

   async create(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as AuthDataType;

      const newAddress = new AddressModel({
         userId: user.publicId,
         ...req.body,
      });

      await newAddress.save();

      try {
         res.json({
            message: "Address created successfully.",
            success: true,
            address: newAddress,
            timestamp: new Date(),
         });
      } catch (error: any) {
         res.status(500).send("Error Fetching  order: " + error.message);
      }
   },
};

export default AddressController;