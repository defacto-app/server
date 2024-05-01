import { Request, Response } from "express";
import UserModel from "../../model/user.model";
import { AuthDataType } from "../../model/auth.model";

const UserController = {
   async updateUser(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as AuthDataType;



      try {
         const updatedUser = await UserModel.findOneAndUpdate(
            { userId: user.publicId },
            {
               $set: req.body,
               updated_at: new Date(),
            },
            { new: true }
         );

         if (!updatedUser) {
            res.status(404).send({
               message: "User not found",
               success: false,
               timestamp: new Date(),
            });
            return;
         }

         // Send the updated user back to the client
         res.json({
            message: "User updated successfully",
            success: true,
            timestamp: new Date(),
         });
      } catch (error: any) {
         // Handle possible errors
         res.status(500).send("Error updating user: " + error.message);
      }

   },
};

export default UserController;
