import UserModel from "../model";
import AuthModel from "../../auth/model";
import EmailEvent from "../../events/email.event";
import { z } from "zod";

const updateEmailSchema = z.object({
   name: z.string().min(2, "Name must be at least 2 characters"),
   email: z.string().email("Invalid email format"),
});

class AccountService {
   static validateUpdateEmailData(data: any) {
      return updateEmailSchema.parse(data);
   }

   static async checkNoChangesMade(name: string, email: string, AuthUser: any) {
      if (name === AuthUser.firstName && email === AuthUser.email) {
         throw new Error("No changes detected");
      }
   }

   static async updateUserName(name: string, AuthUser: any) {
      if (name && name !== AuthUser.firstName) {
         await UserModel.findOneAndUpdate(
            { userId: AuthUser.userId },
            { $set: { firstName: name } },
            { new: true }
         );
      }
   }

   static async handleEmailUpdate(email: string, AuthUser: any) {
      if (email && email !== AuthUser.email) {
         const existingUser = await AuthModel.findOne({
            email: email.toLowerCase(),
            publicId: { $ne: AuthUser.userId },
         });

         if (existingUser) {
            throw new Error("Email is already in use");
         }

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

         const updatedUser = await AuthModel.findOneAndUpdate(
            { publicId: AuthUser.userId },
            update,
            { new: true }
         );

         if (!updatedUser) {
            throw new Error("User not found");
         }

         await EmailEvent.sendOtpChnageMail({
            email: email.toLowerCase(),
            otp: verificationToken,
         });

         return true;
      }
      return false;
   }

   static async verifyEmailChange(code: string, AuthUser: any) {
      if (!code) {
         throw new Error("Verification code is required");
      }

      const pendingChange = AuthUser?.email_management?.change;

      if (!pendingChange) {
         throw new Error("No email change request found");
      }

      if (pendingChange.expires_at < new Date()) {
         throw new Error("Verification code has expired");
      }

      if (pendingChange.token !== code) {
         throw new Error("Invalid verification code");
      }

      const emailExists = await UserModel.findOne({
         email: pendingChange.newEmail,
      });

      if (emailExists) {
         throw new Error("The email is already in use by another account.");
      }

      const updatedUser = await UserModel.findOneAndUpdate(
         { userId: AuthUser.publicId },
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
         throw new Error("User not found");
      }

      // Update the user's email in the auth model

      await AuthModel.findOneAndUpdate(
         { publicId: AuthUser.userId },
         {
            $set: {
               email: pendingChange.newEmail,
               "email_management.verified": true,
            },
            $push: {
               "email_management.previousEmails": AuthUser.email,
            },
         },
         { new: true }
      );

      return updatedUser;



   }
}

export default AccountService;
