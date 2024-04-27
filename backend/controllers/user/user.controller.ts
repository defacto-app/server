import { Request, Response } from "express";
import { supabase } from "../../../config/supabase.config";

const UserController = {


   async updateUser(req: Request, res: Response): Promise<void> {

      const user = res.locals.user;


      res.status(200).json({
         message: "User updated",
         data: user,
      });
/*
      try {
         const { firstName } = req.body;


         const { data, error } = await supabase.auth.updateUser({
            data: { firstName: firstName },
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
      }*/
   },


};

export default UserController;



