import type { NextFunction, Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import AddressModel from "./model";

class AddressMiddleware {
   public async addressPublicId(
      req: Request,
      res: Response,
      next: NextFunction
   ) {
      const publicId = req.params.publicId;

      try {
         if (!publicId) {
            return res
               .status(400)
               .json({ error: "Address publicId is required" });
         }

         const address = await AddressModel.findOne({ publicId });

         if (!address) {
            // Return after sending the response to avoid calling next()
            return SendResponse.notFound(
               res,
               `Sorry, Address ${publicId} is deleted or doesn't exist`
            );
         }

         // Store address in res.locals and proceed if found
         res.locals.address = address;

         // Move to the next middleware or controller
         return next();
      } catch (error: any) {
         // Handle server errors and return a server error response
         return SendResponse.serverError(res, error.message);
      }
   }
}

export default new AddressMiddleware();
