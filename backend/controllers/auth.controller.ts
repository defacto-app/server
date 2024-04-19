import e, { Request, Response } from "express";

import { supabase } from "../../config/supabase.config";

const AuthController = {
   async login(
      req: Request,
      res: Response,
   ): Promise<e.Response<any, Record<string, any>>> {
      try {
         const { email, password } = req.body;

         const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
         });

         if (error) {
            return res.status(400).json({
               message: "Failed to login",
               error: error.message,
            });
         }

         return res.status(200).json({
            message: "User logged in",
            data: data,
         });
      } catch (e: any) {
         return res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
         });
      }
   },

   async register(req: Request, res: Response): Promise<void> {
      // check if user exists

      try {

         const { email, password } = req.body;

         const { data, error } = await supabase.auth.signUp({
            email,
            password,
         });

         if (error) {
            res.status(400).json({
               message: "Failed to register",
               error: error.message,
            });
         }

         res.status(201).json({
            message: "User created",
            data: data,
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async ping(req: Request, res: Response): Promise<void> {


      try {

         const { data, error } = await supabase.auth.getUser(req.body.token);


         if (error) {
            res.status(400).json({
               message: "Failed to register",
               error: error.message,
            });
         }

         res.status(201).json({
            message: "User created",
            data: data,
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default AuthController;
