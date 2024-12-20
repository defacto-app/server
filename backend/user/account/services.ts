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
}

export default AccountService;