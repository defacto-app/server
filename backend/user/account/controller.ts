import SendResponse from "../../libs/response-helper";
import type { Request, Response } from "express";
import UserModel from "../model";
import { z } from "zod";

import AuthModel from "../../auth/model";
import EmailEvent from "../../events/email.event";
import AccountService from "./services";
const updateEmailSchema = z.object({
   name: z.string().min(2, "Name must be at least 2 characters"),
   email: z.string().email("Invalid email format"),
});

const AccountController = {
   async updateAccountDetails(req: Request, res: Response): Promise<void> {
      try {
         const user = res.locals.user;
         const { phoneNumber } = req.body;

         // First validate the phone number format
         if (!phoneNumber || !/^\d{11,15}$/.test(phoneNumber)) {
            throw new Error(
               "Invalid phone number format. Must be between 11 and 15 digits"
            );
         }

         // Get the current user first to check if they already have a phone number
         const currentUser = await UserModel.findOne({
            publicId: user.publicId,
         });
         if (!currentUser) {
            throw new Error("User not found");
         }

         // Check if phone number is already in use by someone else
         const existingUser = await UserModel.findOne({
            phoneNumber: phoneNumber,
            publicId: { $ne: user.publicId }, // Exclude current user
         });

         if (existingUser) {
            throw new Error("Phone number is already in use by another user");
         }

         // Update the user's phone number
         const updatedUser = await UserModel.findOneAndUpdate(
            { publicId: user.publicId },
            { $set: { phoneNumber } },
            {
               new: true,
               runValidators: true,
            }
         );

         // Determine if this was an add or update operation
         const successMessage = currentUser.phoneNumber
            ? "Phone number updated successfully"
            : "Phone number added successfully";

         SendResponse.success(res, successMessage, updatedUser);
      } catch (error: any) {
         SendResponse.badRequest(
            res,
            error.message || "Failed to process phone number",
            error
         );
      }
   },

   async update_name_email(
      req: Request,
      res: Response
   ): Promise<Response | undefined> {
      try {
         const AuthUser = res.locals.user as any;

         // Validate request body
         const validatedData = AccountService.validateUpdateEmailData(req.body);
         const { email, name } = validatedData;

         // Check if any changes were actually made
         await AccountService.checkNoChangesMade(name, email, AuthUser);

         // Update name if provided
         let responseMessage = "";
         if (name && name !== AuthUser.firstName) {
            await AccountService.updateUserName(name, AuthUser);
            responseMessage = "Name updated successfully";
         }

         // Handle email update with OTP if email is different
         if (email && email !== AuthUser.email) {
            const isEmailChange = await AccountService.handleEmailUpdate(
               email,
               AuthUser
            );
            responseMessage = responseMessage
               ? "Name updated and verification code sent to your new email address"
               : "Verification code sent to your new email address";
            return SendResponse.success(res, responseMessage, {
               isEmailChange,
            });
         }

         return SendResponse.success(res, responseMessage, {
            isEmailChange: false,
         });
      } catch (error) {
         console.error("Update failed:", error);
         return SendResponse.badRequest(
            res,
            error instanceof Error ? error.message : "Something went wrong",
            error
         );
      }
   },

   // Second controller - handles verification
   async verify_email_change(req: Request, res: Response): Promise<Response> {
      try {
         const user = res.locals.user as any;

         console.log("User from res.locals:", user);

         const AuthUser = await AuthModel.findOne({ publicId: user.userId });
         console.log("AuthUser fetched:", AuthUser);

         const { code } = req.body;
         console.log("Code from request body:", code);

         // Validate the code exists
         if (!code) {
            console.log("No verification code provided.");
            return SendResponse.badRequest(
               res,
               "Verification code is required"
            );
         }

         // Get the pending change
         const pendingChange = AuthUser?.email_management?.change;
         console.log("Pending email change request:", pendingChange);

         if (!pendingChange) {
            console.log("No email change request found.");
            return SendResponse.badRequest(
               res,
               "No email change request found"
            );
         }

         // Check if code has expired
         if (pendingChange.expires_at < new Date()) {
            console.log(
               "Verification code has expired:",
               pendingChange.expires_at
            );
            return SendResponse.badRequest(
               res,
               "Verification code has expired"
            );
         }

         // Verify the code
         if (pendingChange.token !== code) {
            console.log(
               "Invalid verification code. Provided:",
               code,
               "Expected:",
               pendingChange.token
            );
            return SendResponse.badRequest(res, "Invalid verification code");
         }

         // Check if the new email already exists
         const emailExists = await UserModel.findOne({
            email: pendingChange.newEmail,
         });
         if (emailExists) {
            console.log(
               "Duplicate email error. Email already exists:",
               pendingChange.newEmail
            );
            return SendResponse.badRequest(
               res,
               "The email is already in use by another account."
            );
         }

         // Update the email
         console.log(
            "Updating user email. User ID:",
            user.userId,
            "New Email:",
            pendingChange.newEmail
         );

         const updatedUser = await UserModel.findOneAndUpdate(
            { userId: user.userId },
            {
               $set: {
                  email: pendingChange.newEmail,
                  "email_management.verified": true,
               },
               $unset: {
                  "email_management.change": 1,
               },
            },
            { new: true }
         );

         console.log("Updated user:", updatedUser);

         if (!updatedUser) {
            console.log("User not found during email update.");
            return SendResponse.notFound(res, "User not found");
         }

         console.log("Email updated successfully. Response data:", {
            email: updatedUser.email,
            firstName: updatedUser.firstName,
         });
         return SendResponse.success(res, "Email updated successfully", {
            email: updatedUser.email,
            firstName: updatedUser.firstName,
         });
      } catch (error: any) {
         console.error("Verify email change error:", error);

         // Gracefully handle the duplicate key error
         if (error.code === 11000 && error.keyPattern?.email) {
            console.log("Duplicate key error:", error.keyValue.email);
            return SendResponse.badRequest(
               res,
               "The email address is already associated with another account."
            );
         }

         return SendResponse.badRequest(
            res,
            error instanceof Error
               ? error.message
               : "Failed to verify email change",
            error
         );
      }
   },
   /*	async allAddress(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;

		try {
			const address = await AddressModel.find({
				userId: user.publicId,
			})
				.select("-_id -updatedAt")
				.sort({
					createdAt: -1,
				}); // Exclude these fields

			SendResponse.success(res, "Address retrieved successfully", address);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async addAddress(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as AuthDataType;
		console.log(user.publicId, "user");

		const newAddress = new AddressModel({
			userId: user.publicId,
			...req.body,
		});

		await newAddress.save();

		try {
			SendResponse.success(res, "New address added", newAddress);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async deleteAddress(req: Request, res: Response): Promise<void> {
		const address = res.locals.address;

		try {
			await AddressModel.findOneAndDelete({ publicId: address.publicId });
			SendResponse.success(res, "Address deleted successfully", {});
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},*/
};

export default AccountController;
