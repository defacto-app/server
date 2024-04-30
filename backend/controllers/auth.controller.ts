import { Request, Response } from "express";

import { supabase } from "../../config/supabase.config";
import UserModel, { UserDataType } from "../model/user.model";
import AuthValidator from "../validator/auth.validator";
import bcrypt from "bcrypt";
import { generateToken } from "../services/jwt.service";
import moment from "moment";
import { generateOTP } from "../utils/utils";
import { sendTokenSms } from "../services/sms.service";

const AuthController = {
   async phone_register(req: Request, res: Response): Promise<void> {
      try {
         // Validate the input
         const { data, error } = await AuthValidator.phone_register(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid phone number",
               error,
               success: false,
            });
            return;
         }

         //  check if user exists

         const userExists = await UserModel.findOne({
            phoneNumber: data?.phoneNumber,
         });

         if (userExists) {
            res.status(200).json({
               message: "User already exists",
               exists: true,
               timestamp: new Date(),
            });
         }

         const otp = generateOTP();

         const newUser = new UserModel({
            phoneNumber: data?.phoneNumber,
            phone_management: {
               otp: otp,
               otp_expires_at: moment().add(10, "minutes").toISOString(),
            },
         });

         // @ts-expect-error
         const {  error: smsError } = await sendTokenSms(
            otp,
            data?.phoneNumber
         );

         if (smsError) {
            res.status(500).json({
               message: "Failed to send OTP",
               success: false,
               error: smsError,
            });
            return;
         }

         // create user in db and save otp

         await newUser.save();

         res.status(200).json({
            message: "OTP sent successfully. Please verify.",
            success: true,
            timestamp: new Date(),
         });
      } catch (e) {
         console.error("Registration Error:", e);
         res.status(500).json({
            message: "Internal Server Error",
            error: e,
            success: false,
            timestamp: new Date(),
         });
      }
   },

   async email_register(req: Request, res: Response): Promise<void> {
      // check if user exists

      try {
         const { data, error } = await AuthValidator.email_register(req.body);

         const user = await UserModel.findOne<UserDataType>({
            email: req.body.email,
         });

         if (user) {
            res.status(400).json({
               message: "User already exists",
               success: false,
            });

            return;
         }
         if (error) {
            res.status(400).json({
               message: "Failed to register",
               error: error,
            });
         }

         // Hash the password before saving
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(data!.password, saltRounds);

         const newUser = new UserModel({
            email: data!.email,
            password: hashedPassword, // Save the hashed password
         });

         await newUser.save();

         res.status(201).json({
            message: "User created",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },

   //

   async phone_login(req: Request, res: Response): Promise<void> {
      try {
         // Validate input
         const { data, error } = await AuthValidator.phone_login(req.body);
         if (error) {
            res.status(400).json({ message: "Validation failed", error });
            return;
         }

         // find user by phone number

         const userExists = await UserModel.findOne({
            phoneNumber: data?.phoneNumber,
            "phone_management.otp": data?.otp,
         });

         if (!userExists) {
            res.status(404).json({ message: "User not found" });
            return;
         }

         // Check if OTP is still valid
         const currentTime = new Date();
         const otpExpiryTime = new Date(
            userExists.phone_management.otp_expires_at
         );

         console.log("currentTime", currentTime, otpExpiryTime, userExists);

         if (currentTime > otpExpiryTime) {
            res.status(400).json({ message: "OTP has expired" });
            return;
         }

         // Generate token for the session
         const token = generateToken(userExists);

         // Send response
         res.status(200).json({
            message: "User logged in successfully",
            // data: user,
            token,
         });
      } catch (e: any) {
         res.status(500).json({ error: e.message });
      }
   },

   async email_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.email_login(req.body);

         if (error) {
            res.status(400).json({
               message: "Failed to login",
               error: error,
               success: false,
            });
         }

         const user = await UserModel.findOne<UserDataType>({
            email: data!.email,
         });
         if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
         }

         const isMatch = await UserModel.comparePassword(
            req.body.password,
            user!.password
         );

         if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
         }

         const token = generateToken(user!);

         res.status(200).json({
            message: "User logged in",
            success: true,
            token,
         });
      } catch (e) {
         res.status(500).json({
            error: e,
            success: false,
         });
      }
   },

   //

   async phone_number_exist(req: Request, res: Response): Promise<void> {
      try {
         const { email } = req.body;

         // check if user exists
         const userExists = await UserModel.findOne({ ph: email });
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
   async email_exist(req: Request, res: Response): Promise<void> {
      try {
         const { email } = req.body;

         // check if user exists
         const userExists = await UserModel.findOne({ email: email });
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

   //

   async confirm_phone_number(req: Request, res: Response): Promise<void> {
      const body = req.body as { phoneNumber: string };

      try {
         const { data, error } = await AuthValidator.validPhoneNumber(body);

         // const answer =   await sendSms();

         if (error) {
            res.status(400).json({
               message: "Failed to confirm phone number",
               error: error,
            });
         }

         res.status(200).json({
            message: "Phone number confirmed",
            data,
         });
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
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
};

export default AuthController;
