import { Request, Response } from "express";
import Chance from "chance";

import UserAuthModel from "../../model/userAuth.model";


const DashboardController = {
   async all_users(req: Request, res: Response): Promise<void> {
      try {
         const users = await UserAuthModel.find({});

         res.status(200).json(users);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   }
};

export default DashboardController;
