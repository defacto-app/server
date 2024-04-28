import { Request, Response } from "express";
import { supabase } from "../../../config/supabase.config";

const UserController = {


   async updateUser(req: Request, res: Response): Promise<void> {

      const { firstName } = req.body;

      // Check if the user is authenticated and get their session token
      const session = req.headers.authorization; // Assuming you're passing the session token in the authorization header

      if (!session) {
         res.status(401).json({
            message: "Unauthorized",
         });
      }

      console.log("session", session);

      try {


         const { data, error } = await supabase.auth.updateUser({
            data: { firstName: "report me" },
         });

         if (error) {
            res.status(400).json({
               message: "Failed to login",
               error: error.message,
            });
         }

         res.status(200).json({
            message: "User logged in",
            data: data,
         });

      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
         });
      }
   },


};

export default UserController;



