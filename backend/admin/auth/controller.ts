import type { Request, Response } from "express";

import AuthValidator from "../../auth/validator";

import AuthModel from "../../auth/model";
import SendResponse from "../../libs/response-helper";

import { generateToken } from "../../services/jwt.service";

const AdminAuthController = {

   async admin_login(req: Request, res: Response): Promise<void> {
      console.log("Admin login");
      try {
         const { data, error } = await AuthValidator.admin_login(req.body);

         if (error) {
            SendResponse.badRequest(res, "Invalid email address", error);
            return;
         }

         // check if user exists by email and role only
         const user = await AuthModel.findOne({
            email: data?.email,
            role: "admin",
         });

         if (!user) {
            SendResponse.notFound(res, "Admin not found");
            return;
         }

         // Now check if the OTP matches
         if (user.email_management.login.token !== data?.otp) {
            SendResponse.badRequest(res, "Invalid OTP", {
               otp: "Invalid OTP",
            });
            return;
         }

         // Check if OTP is still valid
         const currentTime = new Date();
         const otpExpiryTime = new Date(user.email_management?.login.expires_at || Date.now());

         if (currentTime > otpExpiryTime) {
            SendResponse.badRequest(res, "OTP has expired", {
               otp: "OTP has expired",
            });
            return;
         }

         const token = generateToken(user);

         SendResponse.success(res, "Admin logged in", { token });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   async send_otp(req: Request, res: Response): Promise<void> {

      const body = req.body;

      console.log("Send OTP",body);

      try {
         SendResponse.success(res, "OTP sent successfully. Please verify.", {});
      }
      catch (e: any) {
         SendResponse.serverError(res, e.message);
      }

   },

   async ping(req: Request, res: Response): Promise<void> {
      const currentUser = res.locals.user;

      const packages = res.locals.packages;

      try {
         SendResponse.success(res, "", {
            user: currentUser,
            packages,
         });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
}
export default AdminAuthController;
