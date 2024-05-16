import { Request, Response } from "express";

import { supabase } from "../../config/supabase.config";
import AuthModel, { AuthDataType } from "./model";
import AuthValidator from "./validator";
import { generateToken } from "../services/jwt.service";
import moment from "moment";
import { generateOTP } from "../utils/utils";
import { sendTokenSms } from "../services/sms.service";
import EmailEvent from "../events/email.event";
import UserModel from "../user/model";
import { nanoid } from "nanoid";
import SendResponse from "../libs/response-helper";
import env from "../../config/env";

const AuthController = {
   async email_register(req: Request, res: Response): Promise<void> {
      // check if user exists

      try {
         const { data, error } = await AuthValidator.email_register(req.body);

         const user = await AuthModel.findOne<AuthDataType>({
            email: req.body.email,
         });

         if (user) {
            SendResponse.badRequest(res, "User already exists");
         }
         if (error) {
            SendResponse.badRequest(res, "Failed to register", error);
         }

         const hashedPassword = await AuthModel.hashPassword(data!.password);

         const email_token = nanoid(10);

         const newAuth = new AuthModel({
            email: data!.email,
            password: hashedPassword, // Save the hashed password
            email_management: {
               otp: email_token,
               otp_sent_at: new Date(),
               otp_expires_at: moment().add(10, "minutes").toDate(),
            },
            phoneNumber: undefined,
            phone_management: {
               login: undefined as any,
            },
         });

         await newAuth.save();

         const token = generateToken(newAuth);

         // create user in db

         const newUser = new UserModel({
            email: data!.email,
            userId: newAuth.publicId,
            phoneNumber: undefined,
            joinedAt: new Date(),
            lastSeenAt: new Date(),
         });

         await newUser.save();

         await EmailEvent.sendWelcomeMail({
            email: newUser.email,
            link: `${env.API_URL}/auth/verify/email/${email_token}?email=${encodeURIComponent(newUser.email)}`,
         });

         SendResponse.success(res, "User created", { token });
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },

   //

   async confirm_phone_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.phone_number(req.body);

         if (error) {
            SendResponse.badRequest(res, "Invalid phone number", error);
         }

         /// send otp

         const otp = generateOTP();

         const user = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,
         });

         if (!user) {
            // create user in db and save otp

            const newUser = new AuthModel({
               phoneNumber: data?.phoneNumber,
               email: undefined,
               phone_management: {
                  login: {
                     firstTime: true,
                     otp: otp,
                     sent_at: new Date(),
                     expires_at: moment().add(10, "minutes").toDate(),
                  },
               },
            });

            await newUser.save();

            SendResponse.success(res, "OTP sent successfully. Please verify.", {
               userExists: false,
            });
            return;
         }

         // update user in db and save otp

         if (data?.phoneNumber) {
            await AuthModel.findOneAndUpdate(
               { phoneNumber: data?.phoneNumber }, // find a document with this filter
               {
                  "phone_management.login.otp": otp,
                  "phone_management.login.sent_at": new Date(),
                  "phone_management.login.expires_at": moment()
                     .add(10, "minutes")
                     .toDate(),
               },
               { new: true } // option to return the updated document
            );
            const { error: smsError } = await sendTokenSms(
               otp,
               data?.phoneNumber
            );

            if (smsError) {
               SendResponse.serviceUnavailable(
                  res,
                  "Failed to send OTP",
                  smsError
               );
            }
         }

         SendResponse.success(res, "OTP sent successfully. Please verify.", {
            userExists: true,
         });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //

   async phone_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.phone_login(req.body);
         if (error) {
            SendResponse.badRequest(res, "Invalid phone number", error);
         }

         const user = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,
         });
         if (!user) {
            SendResponse.notFound(res, "User not found");

            return;
         }

         if (user.phone_management.login.otp !== data?.otp) {
            SendResponse.badRequest(res, "Invalid OTP");
            return;
         }

         const currentTime = new Date();
         const otpExpiryTime = new Date(user.phone_management.login.expires_at);
         if (currentTime > otpExpiryTime) {
            SendResponse.badRequest(res, "OTP has expired", {
               otp: "OTP has expired",
            });
            return;
         }

         const token = generateToken(user);
         let newUser = null;

         if (user.phone_management.login.firstTime) {
            newUser = new UserModel({
               phoneNumber: data?.phoneNumber,
               userId: user.publicId,
               role: user.role,
               joinedAt: new Date(),
               lastSeenAt: new Date(),

               email: undefined,
            });
            await newUser.save();

            await AuthModel.findOneAndUpdate(
               {
                  phoneNumber: data?.phoneNumber,
                  "phone_management.login.firstTime": true,
               },
               {
                  $unset: {
                     "phone_management.login.firstTime": "",
                     "phone_management.login.otp": "",
                     "phone_management.login.expires_at": "",
                  },
               },
               { new: true }
            );
         }

         // dont change yet
         SendResponse.success(res, "Logged in successfully", {
            firstTime: user.phone_management.login.firstTime ? true : undefined,
            token,
         });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //

   async email_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.email_login(req.body);

         if (error) {
            SendResponse.badRequest(res, "Invalid email or password", error);
         }

         const user = await AuthModel.findOne<AuthDataType>({
            email: data!.email,
         });

         if (!user || !user.password) {
            SendResponse.unauthorized(res, "Invalid email or password");
            return;
         }

         const isMatch = await AuthModel.comparePassword(
            req.body.password,
            user!.password
         );

         if (!isMatch) {
            SendResponse.unauthorized(res, "Invalid email or password");
         }

         const token = generateToken(user!);

         SendResponse.success(res, "Login Successful", { token });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //

   async email_exist(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.email_address(req.body);

         if (error) {
            SendResponse.badRequest(res, "Invalid email address", error);

            return;
         }

         // check if user exists
         const userExists = await AuthModel.findOne({ email: data?.email });
         if (userExists) {
            const otp = generateOTP();
            await AuthModel.findOneAndUpdate(
               { email: data?.email }, // find a document with this filter
               {
                  "email_management.otp": otp,
                  "email_management.otp_sent_at": new Date(),
                  "email_management.otp_expires_at": moment()
                     .add(10, "minutes")
                     .toDate(),
               },
               { new: true } // option to return the updated document
            );

            await EmailEvent.sendContactMail({
               email: "here we go",
               message: `here we go ${otp}`,
            });

            SendResponse.success(res, "OTP sent successfully", {
               exists: true,
            });
         } else {
            SendResponse.success(res, "User not found", { exists: false });
            return;
         }

         SendResponse.success(res, "", {
            exists: true,
         });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //

   async email_confirm(req: Request, res: Response): Promise<void> {
      console.log("email_confirm");
      const { token } = req.params;
      const { email } = req.query; // Retrieve email from query parameters

      try {
         if (!email) {
            SendResponse.badRequest(res, "Email query parameter is required");
            return;
         }

         // Find user by the email token and email
         const user = await AuthModel.findOne({
            email: email as string, // Cast to string as query parameters are always strings
            "email_management.otp": token,
            "email_management.otp_expires_at": { $gt: new Date() }, // Ensure token is not expired
         });

         if (!user) {
            SendResponse.badRequest(res, "Invalid or expired token");
            return;
         }

         // Mark email as verified

         // Mark email as verified
         user.email_management.verified = true;
         user.email_management.email_confirmed_at = new Date();
         user.email_management.otp = "";
         await user.save();

         // redirect to the frontend
         return res.redirect(
            `${env.FRONTEND_URL}/verification-success?email=${encodeURIComponent(email as string)}`
         );
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //

   async admin_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.admin_login(req.body);

         if (error) {
            SendResponse.badRequest(res, "Invalid email address", error);
            return;
         }

         // check if user exists
         const user = await AuthModel.findOne({
            email: data?.email,
            role: "admin",
            "email_management.otp": data!.otp,
         });

         if (!user) {
            SendResponse.notFound(res, "Admin not found");
            return;
         }

         if (user.email_management.otp !== data!.otp) {
            SendResponse.badRequest(res, "Invalid OTP", {
               pin: "Invalid OTP",
            });
            return;
         }

         // Check if OTP is still valid

         const currentTime = new Date();

         const otpExpiryTime = new Date(
            user.email_management?.otp_expires_at || Date.now()
         );
         if (currentTime > otpExpiryTime) {
            SendResponse.badRequest(res, "OTP has expired", {
               otp: "OTP has expired",
            });
         }

         const token = generateToken(user);

         SendResponse.success(res, "Admin logged in", { token });
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //

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
   //

   async logout(req: Request, res: Response): Promise<void> {
      try {
         const { error } = await supabase.auth.signOut();

         if (error) {
            SendResponse.badRequest(res, "Failed to logout", error);
         }

         SendResponse.success(res, "User logged out", {});
      } catch (e: any) {
         SendResponse.serverError(res, e.message);
      }
   },
   //
};

export default AuthController;
