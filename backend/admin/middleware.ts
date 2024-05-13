import { NextFunction, Request, Response } from "express";

import { verifyToken } from "../services/jwt.service";
import AuthModel from "../auth/model";


class AdminMiddleware {

   public async validateAdmin(req: Request, res: Response, next: NextFunction) {
      const authorization = req.headers["authorization"] as string;

      if (!authorization) {
         return res.status(401).json({ error: "Authorization token required" });
      }

      const token = authorization.split(" ")[1];

      try {
         const data = await verifyToken(token);

         if (!data) {
            return res.status(401).json({ error: "invalid token" });
         }

         const user = await AuthModel.findById(data.id, {
            password: 0,
            createdAt: 0,
            updatedAt: 0,
         });

         if (!user) {
            return res.status(401).json({ error: "invalid token" });
         }

         if (user.role !== "admin") {
            return res.status(401).json({ error: "Unauthorized" });
         }

         res.locals.user = user;

         // update last seen

         return next();
      } catch (error) {
         return res.status(401).json({ error: "Invalid token" });
      }
   }



}


export default new AdminMiddleware();
