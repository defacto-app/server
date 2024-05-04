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
import { nanoid } from "nanoid";

const AuthController = {
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
            userId: newAuth.publicId,
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
            message: "An unexpected error occurred",
         });
      }
   },

   //

   async confirm_phone_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.phone_number(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid phone number",
               success: false,
               timestamp: new Date(),
               error,
            });
            return;
         }

         /// send otp

         const otp = generateOTP();

         const user = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,
         });

         console.log(user);
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

            res.status(200).json({
               message: "OTP sent successfully. Please verify.",
               userExists: false,
               timestamp: new Date(),
               success: true,
            });
            return;
         }

         // update user in db and save otp

         // remove this later
         if (!user.phone_management.login.otp && data?.phoneNumber) {
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
               res.status(500).json({
                  message: "Failed to send OTP",
                  error: smsError,
                  timestamp: new Date(),
                  success: false,
               });
               return;
            }
         }

         res.status(200).json({
            message: "OTP sent successfully. Please verify.",
            userExists: true,
         });
         return;
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            error: e.message,
            success: false,
            timestamp: new Date(),
         });
      }
   },
   //
   //
   //
   //

   async phone_login(req: Request, res: Response): Promise<void> {
      const randomEmial = `${nanoid()}@defacto.com.ng`;
      try {
         const { data, error } = await AuthValidator.phone_login(req.body);
         if (error) {
            res.status(400).json({
               error,
               success: false,
               timestamp: new Date(),
            });
            return;
         }

         const user = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,

         });
         if (!user) {
            res.status(404).json({
               message: "User not found",
               success: false,
               timestamp: new Date(),
            });
            return;
         }

         if (user.phone_management.login.otp !== data?.otp) {
            res.status(400).json({
               error: { otp: "Invalid OTP" },
               success: false,
               timestamp: new Date(),
            });
            return;
         }

         const currentTime = new Date();
         const otpExpiryTime = new Date(user.phone_management.login.expires_at);
         if (currentTime > otpExpiryTime) {
            res.status(400).json({
               error: { otp: "OTP has expired" },
               success: false,
               timestamp: new Date(),
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
               random_email: true,
               email: randomEmial,
            });
            await newUser.save();

            await AuthModel.findOneAndUpdate(
               {
                  phoneNumber: data?.phoneNumber,
                  "phone_management.login.firstTime": true,
               },
               {
                  $unset: { "phone_management.login.firstTime": "" },
                  $set: { "phone_management.login.otp": "" },
               },
               { new: true }
            );
         }

         res.status(200).json({
            message: "Logged in successfully",
            success: true,
            timeStamp: new Date(),
            data: newUser,
            firstTime: user.phone_management.login.firstTime ? true : undefined,
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
            success: false,
            message: "An unexpected error occurred",
         });
      }
   },

   async email_exist(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.email_address(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid email address",
               success: false,
               timestamp: new Date(),
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
               message: "OTP sent successfully",
               success: true,
            });
         } else {
            res.status(200).json({
               exists: false,
               timestamp: new Date(),
               success: true,
            });
         }
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            timestamp: new Date(),
            success: false,
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
               timestamp: new Date(),
               success: false,
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
               timestamp: new Date(),
               message: "User not found",
            });
         }
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
            timestamp: new Date(),
            success: false,
         });
      }
   },

   async admin_login(req: Request, res: Response): Promise<void> {
      try {
         const { data, error } = await AuthValidator.admin_login(req.body);

         if (error) {
            res.status(400).json({
               message: "Invalid email address",
               timestamp: new Date(),
               success: false,
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
               success: false,
               timestamp: new Date(),
            });
            return;
         }

         if (user.email_management.otp !== data!.otp) {
            res.status(400).json({
               success: false,
               error: {
                  otp: "Invalid OTP",
               },
               timestamp: new Date(),
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
               success: false,
               error: {
                  otp: "OTP has expired",
               },
               timestamp: new Date(),
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

            success: false,
            timestamp: new Date(),
         });
      }
   },

   async ping(req: Request, res: Response): Promise<void> {
      const currentUser = res.locals.user;

      try {
         res.status(200).json({
            data: currentUser,
            timestamp: new Date(),
            success: true,
         });
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",

            success: false,
            timestamp: new Date(),
         });
      }
   },

   async logout(req: Request, res: Response): Promise<void> {
      try {
         const { error } = await supabase.auth.signOut();

         if (error) {
            res.status(400).json({
               message: error.message,

               error: error.message,
            });
         }

         res.status(200).json({
            message: "User logged out",
            success: true,
            timestamp: new Date(),
         });
      } catch (e: any) {
         res.status(500).json({
            message: "An unexpected error occurred",
         });
      }
   },
};

export default AuthController;
