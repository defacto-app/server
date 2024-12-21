import SendResponse from "../../libs/response-helper";
import type { Request, Response } from "express";
import UserModel from "../model";

import AuthModel from "../../auth/model";
import AccountService from "./services";
import { sendTokenSms } from "../../services/sms.service";
import { generateOTP } from "../../utils/utils";
import AuthValidator from "../../auth/validator";

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

   // TypeScript
   async update_phone_number(req: Request, res: Response): Promise<void> {
      try {
         const user = res.locals.user as any;

         const { data, error } = await AuthValidator.phone_number(req.body);

         if (error) {
            SendResponse.badRequest(res, "Invalid phone number", error);
         }

         // Check if phone number is already in use
         const existingUser = await AuthModel.findOne({
            phoneNumber: data?.phoneNumber,
            publicId: { $ne: user.publicId },
         });

         if (existingUser) {
            throw new Error("Phone number is already in use by another user");
         }

         // Generate OTP
         const otp = generateOTP();

         const expiresIn = 30 * 60 * 1000; // 30 minutes
         if (data?.phoneNumber) {
            // Save OTP and new phone number
            await AuthModel.findOneAndUpdate(
               { publicId: user.userId },
               {
                  $set: {
                     "phone_management.change": {
                        newPhoneNumber: data?.phoneNumber,
                        otp: otp,
                        expires_at: new Date(Date.now() + expiresIn),
                        sent_at: new Date(),
                     },
                  },
               },
               { new: true }
            );

            // Send OTP to the new phone number
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
               return;
            }
         }

         SendResponse.success(
            res,
            "Verification code sent to your new phone number"
         );
      } catch (error: any) {
         SendResponse.badRequest(
            res,
            error.message || "Failed to process phone number",
            error
         );
      }
   },
   // TypeScript
   async verify_phone_number(req: Request, res: Response): Promise<void> {
      try {
          const user = res.locals.user as any;
          const { otp } = req.body;

          if (!otp) {
              throw new Error("OTP is required");
          }

          // Find the user in the AuthModel
          const authUser = await AuthModel.findOne({ publicId: user.userId });

          if (!authUser) {
              throw new Error("User not found");
          }

          if (!authUser.phone_management?.change) {
              throw new Error("No phone number change request found");
          }

          const changeRequest = authUser.phone_management.change as any;

          // Check if OTP is expired
          if (new Date(changeRequest.expires_at) < new Date()) {
              throw new Error("OTP has expired");
          }

          // Check if OTP matches
          if (changeRequest.otp !== otp) {
              throw new Error("Invalid OTP");
          }

          // Initialize previousPhoneNumbers array if it doesn't exist
          if (!authUser.phone_management.previousPhoneNumbers) {
              authUser.phone_management.previousPhoneNumbers = [];
          }

          // Always add the current phone number to previousPhoneNumbers before updating
          if (authUser.phoneNumber) {
              authUser.phone_management.previousPhoneNumbers.push(authUser.phoneNumber);
          }

          // Update with new phone number
          authUser.phoneNumber = changeRequest.newPhoneNumber;
          authUser.phone_management.verified = true;

          // Properly remove the change object
         //  authUser.set("phone_management.change", undefined);

          // Save the updated document
          await authUser.save();

          // Update user model with proper query field
          const updatedUser = await UserModel.findOneAndUpdate(
              { userId: authUser.publicId },  // Changed from userId to publicId and using user.userId
              {
                  $set: {
                      phoneNumber: changeRequest.newPhoneNumber,
                  }
              },
              {
                  new: true,
                  runValidators: true
              }
          );

          if (!updatedUser) {
              throw new Error("Failed to update user model phone number");
          }

          SendResponse.success(res, "Phone number updated successfully");
      } catch (error: any) {
          console.error("Error in verify_phone_number:", error);
          SendResponse.badRequest(
              res,
              error.message || "Failed to verify phone number",
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
         const AuthUser = await AuthModel.findOne({ publicId: user.userId });
         const { code } = req.body;

         const updatedUser = await AccountService.verifyEmailChange(
            code,
            AuthUser
         );

         return SendResponse.success(res, "Email updated successfully", {
            email: updatedUser.email,
            firstName: updatedUser.firstName,
         });
      } catch (error: any) {
         console.error("Verify email change error:", error);

         if (error.code === 11000 && error.keyPattern?.email) {
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
