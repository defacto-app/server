import SendResponse from "../../libs/response-helper";
import type { Request, Response } from "express";
import UserModel from "../model";
import { z } from "zod";

import type { AuthDataType } from "../../auth/model";
import AuthModel from "../../auth/model";
import EmailEvent from "../../events/email.event";
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

   async update_name_email(req: Request, res: Response): Promise<Response> {
      try {
         const AuthUser = res.locals.user as any;

         // Validate request body
         const validatedData = updateEmailSchema.parse(req.body);
         const { email, name } = validatedData;

         // Check if any changes were actually made
         if (name === AuthUser.firstName && email === AuthUser.email) {
            return SendResponse.badRequest(res, "No changes detected");
         }

         // Update name if provided
         if (name && name !== AuthUser.firstName) {
            await UserModel.findOneAndUpdate(
               { userId: AuthUser.userId },
               { $set: { firstName: name } },
               { new: true }
            );
            return SendResponse.success(res, "Name updated successfully", {
               isEmailChange: false,
            });
         }

         // Handle email update with OTP if email is different
         if (email && email !== AuthUser.email) {
            // Check if email already exists
            const existingUser = await AuthModel.findOne({
               email: email.toLowerCase(),
               publicId: { $ne: AuthUser.userId },
            });

            if (existingUser) {
               return SendResponse.badRequest(res, "Email is already in use");
            }

            // Generate verification token
            const verificationToken = Math.floor(
               100000 + Math.random() * 900000
            ).toString();
            const expiresIn = 30 * 60 * 1000; // 30 minutes

            const update = {
               $set: {
                  "email_management.change": {
                     newEmail: email.toLowerCase(),
                     token: verificationToken,
                     expires_at: new Date(Date.now() + expiresIn),
                     sent_at: new Date(),
                  },
               },
            };

            // Save email change request
            const updatedUser = await AuthModel.findOneAndUpdate(
               { publicId: AuthUser.userId },
               update,
               { new: true }
            );

            if (!updatedUser) {
               return SendResponse.notFound(res, "User not found");
            }

            // Send OTP to the new email
            /*      await EmailEvent.sendOtpChnageMail({
               email: email.toLowerCase(),
               otp: verificationToken,
            });
 */
            return SendResponse.success(
               res,
               "Verification code sent to your new email address",
               { isEmailChange: true }
            );
         }

         // Success response if only the name was updated
         return SendResponse.success(res, "Profile updated successfully");
      } catch (error) {
         console.error("Update failed:", error);
         return SendResponse.badRequest(res, "Something went wrong", error);
      }
   },

   // Second controller - handles verification
   async verifyEmailChange(req: Request, res: Response): Promise<Response> {
      try {
         const user = res.locals.user as AuthDataType;
         const { code } = req.body;

         // Validate the code exists
         if (!code) {
            return SendResponse.badRequest(
               res,
               "Verification code is required"
            );
         }

         // Get the pending change
         const pendingChange = user.email_management?.change;
         if (!pendingChange) {
            return SendResponse.badRequest(
               res,
               "No email change request found"
            );
         }

         // Check if code has expired
         if (pendingChange.expires_at < new Date()) {
            return SendResponse.badRequest(
               res,
               "Verification code has expired"
            );
         }

         // Verify the code
         if (pendingChange.token !== code) {
            return SendResponse.badRequest(res, "Invalid verification code");
         }

         // Update the email
         const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
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

         if (!updatedUser) {
            return SendResponse.notFound(res, "User not found");
         }

         return SendResponse.success(res, "Email updated successfully", {
            email: updatedUser.email,
            firstName: updatedUser.firstName,
         });
      } catch (error) {
         console.error("Verify email change error:", error);
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
