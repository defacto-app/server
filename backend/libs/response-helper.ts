import { Response } from "express";
import logger from "../../config/logger";

class SendResponse {
   /**
    * Send a success response.
    */
   static success(res: Response,  message: string, data?: any,) {
      return res.status(200).json({
         success: true,
         message,
         data,
         timestamp: new Date()
      });
   }

   /**
    * Send a generic error response with status 400.
    */
   static badRequest(res: Response, message: string,error?: any) {
      return res.status(400).json({
         success: false,
         message,
         error,
         timestamp: new Date()
      });
   }


   /**
    * Send an unauthorized error response with status 401.
    */
   static unauthorized(res: Response, message: string) {
      return res.status(401).json({
         success: false,
         message,
         timestamp: new Date()
      });
   }

   /**
    * Send a not found error response with status 404.
    */
   static notFound(res: Response, message: string) {
      return res.status(404).json({
         success: false,
         message,
         timestamp: new Date()
      });
   }

   /**
    * Send a server error response with status 500.
    */
   static serverError(res: Response, error: any) {
      logger.error(error);
      return res.status(500).json({
         success: false,
         message: "An unexpected error occurred",
         timestamp: new Date()
      });
   }

   static serviceUnavailable(res: Response, message: string, error?: any) {

     logger.error(error);
      return res.status(503).json({
         success: false,
         message,
         error,
         timestamp: new Date()
      });
   }
}

export default SendResponse;

