import { Response } from "express";
import logger from "../../config/logger";

class sendResponse {
   static success(res: Response, data: any, message: string) {
      return res
         .status(200)
         .json({ success: true, message, data, timestamp: new Date() });
   }

   static error(res: Response, message: string) {
      return res.status(400).json({ success: false, timestamp: new Date() });
   }

   static serverError(res: Response, error: any) {

      logger.error(error);

      return res.status(500).json({
         success: false,
         message: "An unexpected error occurred",
         timestamp: new Date(),
      });
   }
}

export default sendResponse;
