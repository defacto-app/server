import { Request, Response } from "express";
import TeamsModel from "../model/teams.model";

const TeamController = {
   async all(req: Request, res: Response): Promise<void> {
      const all = await TeamsModel.find({});

      try {
         res.status(200).json(all);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default TeamController;
