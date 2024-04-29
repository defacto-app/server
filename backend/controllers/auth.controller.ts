import e, { Request, Response } from "express";

import { supabase } from "../../config/supabase.config";
import UserModel from "../model/user.model";

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
            data,
         });

         /*      // check if user exists

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

      */

         /*   const newUser = new UserModel({
               ...data
            });
   */

         /*         await newUser.save();*/


         res.status(201).json({
            message: "User created",
            email, password,
         });


         // save to mongo db database


         // console.log("newUser", newUser);

      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },


   async ping(req: Request, res: Response): Promise<void> {


      const user = res.locals.user;


      try {


         res.status(200).json({

            data: user,
         });


      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   async logout(req: Request, res: Response): Promise<void> {
      try {
         const { error } = await supabase.auth.signOut();

         if (error) {
            res.status(400).json({
               message: "Failed to logout",
               error: error.message,
            });
         }

         res.status(200).json({
            message: "User logged out",
         });
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
         });
      }
   },

   async userExists(req: Request, res: Response): Promise<void> {
      try {
         const { email } = req.body;

         // check if user exists
         const userExists = await UserModel.findOne({ email: email });
         console.log("userExists", userExists);
         if (userExists) {
            res.status(200).json({
               exists: true,
            });
         } else {
            res.status(200).json({
               exists: false,
            });
         }
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
         });
      }
   },

   async confirmPhoneNumber(req: Request, res: Response): Promise<void> {

      try{



         res.status(200).json({
            message: "Phone number confirmed",
         });
      }catch (e: any){
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
         });
      }
   }
};

export default AuthController;


/*


// check if user exists

const { data: ex, error: er } = await supabase.rpc(
   "get_user_id_by_email",
   {
      email: "admin@gmail.com",
   },
);

/!*     const { data: { users:exitingUser }, error:exitingUserError } = await supabase.auth.admin.listUsers({
        email: email,
     })
*!/

if (ex) {
   console.log("exitingUser", ex);
}

if (er) {
   console.log("exitingUserError", er);
}
*/
