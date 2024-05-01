import { Request, Response } from "express";
import UserModel from "../../model/user.model";

const UserController = {
   async updateUser(req: Request, res: Response): Promise<void> {
      const user = res.locals.user;

      console.log(user);

      try {
         // Find a user by publicId and update with data from req.body
       /*  const updatedUser = await UserModel.findOneAndUpdate(
            { publicId: user.publicId }, // Assuming publicId is stored in req.user
            { $set: req.body },             // Update the fields provided in req.body
            { new: true }                   // Options: return the updated document
         );
*/

         const updatedUser = await UserModel.findOne({ publicId: user.publicId });

         if (!updatedUser) {
             res.status(404).send({
                message: "User not found",
                success: false,
                timestamp: new Date(),
             });
            return
         }

         // Send the updated user back to the client
         res.json(updatedUser);
      } catch (error:any) {
         // Handle possible errors
         res.status(500).send('Error updating user: ' + error.message);
      }
      // update user



      // return updated user







   },
};

export default UserController;
