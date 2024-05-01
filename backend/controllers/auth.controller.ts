import { Request, Response } from "express";

import { supabase } from "../../config/supabase.config";
import AuthModel, { AuthDataType } from "../model/auth.model";
import AuthValidator from "../validator/auth.validator";
import { generateToken } from "../services/jwt.service";
import moment from "moment";
import { generateOTP } from "../utils/utils";
import { sendTokenSms } from "../services/sms.service";
import EmailEvent from "../events/email.event";
import UserModel from "../model/user.model";

const AuthController = {
   async phone_register(req: Request, res: Response): Promise<void> {
      try {
         // Validate the input
         const { data, error } = await AuthValidator.phone_register(req.body);

         if (error !== null) {
            res.status(400).json({
               message: "Invalid phone number",
               error,
               success: false,
            });
            return;
         }
         //  check if user exists

         const userExists = await AuthModel.findOne({
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

         const newUserAuth = new AuthModel({
            phoneNumber: data?.phoneNumber,
            phone_management: {
               otp: otp,
               otp_sent_at: new Date(),
               otp_expires_at: moment().add(10, "minutes").toDate(),
            },
         });

         // create user in db and save otp

         const newUser = new UserModel({
            phoneNumber: data?.phoneNumber,
            joinedAt: new Date(),
            lastSeenAt: new Date(),
         });

         await newUser.save();


         const { error: smsError } = await sendTokenSms(otp, data!.phoneNumber);

         if (smsError) {
            res.status(500).json({
               message: "Failed to send OTP",
               success: false,
               error: smsError,
            });
            return;
         }

         // create user in db and save otp

         await newUserAuth.save();

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

         const user = await AuthModel.findOne<AuthDataType>({
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

         const hashedPassword = await AuthModel.hashPassword(data!.password);

         const otp = generateOTP();

         const newAuth = new AuthModel({
            email: data!.email,
            password: hashedPassword, // Save the hashed password
            email_management: {
               otp: otp,
               otp_sent_at: new Date(),
               otp_expires_at: moment().add(10, "minutes").toDate(),
            },
         });

         await newAuth.save();

         // create user in db

         const newUser = new UserModel({
            email: data!.email,
            userId:newAuth.publicId,
            joinedAt: new Date(),
            lastSeenAt: new Date(),
         });

         await newUser.save();



         await EmailEvent.sendContactMail({
            email: "here we go",
            message: `here we go ${otp}`,
         });

         res.status(201).json({
            message: "User created",
            success: true,
            timestamp: new Date(),
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

         const user = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,
         });

         if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
         }

         if (user.phone_management.otp !== data?.otp) {
            res.status(400).json({ message: "Invalid OTP" });
            return;
         }

         // Check if OTP is still valid
         const currentTime = new Date();
         const otpExpiryTime = new Date(user.phone_management.otp_expires_at);

         if (currentTime > otpExpiryTime) {
            res.status(400).json({ message: "OTP has expired" });
            return;
         }

         // Generate token for the session
         const token = generateToken(user);

         // Send response
         res.status(200).json({
            message: "Logged in successfully",
            success: true,
            timeStamp: new Date(),
            data: user,
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

         const user = await AuthModel.findOne<AuthDataType>({
            email: data!.email,
         });


         if (!user || !user.password) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
         }



         const isMatch = await AuthModel.comparePassword(
            req.body.password,
            user!.password
         );



         if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
         }

         const token = generateToken(user!);

         res.status(200).json({
            message: "Login Successful",
            success: true,
            timestamp: new Date(),
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

   async verify_phone_number(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.phone_number(req.body);

         if (error) {
            res.status(400).json({
               error,
            });
            return;
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
               phone_management: {
                  otp: otp,
                  otp_sent_at: new Date(),
                  otp_expires_at: moment().add(10, "minutes").toDate(),
               },
            });

            await newUser.save();

            res.status(200).json({
               message: "OTP sent successfully. Please verify.",
               userExists: false,
            });
         }

         if (user) {

            // update user in db and save otp

            await AuthModel.findOneAndUpdate(
               { phoneNumber: data?.phoneNumber }, // find a document with this filter
               {
                  "phone_management.otp": otp,
                  "phone_management.otp_sent_at": new Date(),
                  "phone_management.otp_expires_at": moment()
                     .add(10, "minutes")
                     .toDate(),
               },
               { new: true } // option to return the updated document
               );
            res.status(200).json({
               message: "OTP sent successfully. Please verify.",
               userExists: true,
            });
         }

         const { error: smsError } = await sendTokenSms(otp, data!.phoneNumber);

         if (smsError) {
            res.status(500).json({
               message: "Failed to send OTP",
               error: smsError,
            });
            return;
         }

         return;
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
         });
      }
   },

   async phone_number_exist(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.phone_number(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid phone number",
               error,
            });
            return;
         }

         // check if user exists
         const userExists = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,
         });
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
         const { data, error } = await AuthValidator.email_address(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid email address",
               error,
            });
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

   async email_confirm(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.email_address(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid email address",
               error,
            });
            return;
         }

         // check if user exists
         const userExists = await AuthModel.findOne({
            email: data?.email,
            "email_management.otp": req.body.otp,
         });

         if (userExists) {
            await AuthModel.findOneAndUpdate(
               { email: data?.email }, // find a document with this filter
               {
                  "email_management.verified": true, // fields to update
                  "email_management.email_confirmed_at": new Date(),
                  "email_management.otp": "",
               },
               { new: true } // option to return the updated document
            );

            res.status(200).json({
               exists: true,
               message: "Email confirmed",
               success: true,
               timestamp: new Date(),
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

   async admin_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.admin_login(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid email address",
               error,
            });
            return;
         }

         // check if user exists
         const user = await AuthModel.findOne({
            email: data?.email,
            role: "admin",
            "email_management.otp": data!.otp,
         });

         if (!user) {
            res.status(404).json({
               message: "Admin not found",
            });
            return;
         }

         if (user.email_management.otp !== data!.otp) {
            res.status(400).json({
               message: "Invalid OTP",
            });
            return;
         }

         // Check if OTP is still valid

         const currentTime = new Date();

         const otpExpiryTime = new Date(
            user.email_management?.otp_expires_at || Date.now()
         );
         if (currentTime > otpExpiryTime) {
            res.status(400).json({
               message: "OTP has expired",
            });
            return;
         }

         const token = generateToken(user);

         res.status(200).json({
            message: "Admin logged in",
            success: true,
            timeStamp: new Date(),
            token,
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
            timestamp: new Date(),
            success: true,
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
