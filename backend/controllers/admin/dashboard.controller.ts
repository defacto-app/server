import { Request, Response } from "express";
import Chance from "chance";

import UserModel from "../../model/user.model";


const DashboardController = {
   async all_users(req: Request, res: Response): Promise<void> {
      try {
         const users = await UserModel.find({});

         res.status(200).json(users);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   }
};

export default DashboardController;
