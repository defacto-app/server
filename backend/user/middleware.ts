import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../services/jwt.service";
import AuthModel from "../auth/model";
import { ObjectId } from "mongodb";
import SendResponse from "../libs/response-helper";

class AuthMiddleware {
   public async validateUser(req: Request, res: Response, next: NextFunction) {
      const authorization = req.headers.authorization as string;

      if (!authorization) {
         SendResponse.unauthorized(res, "Authorization token required");
      }

      const token = authorization.split(" ")[1];

      if (!token) {
         return SendResponse.unauthorized(
            res,
            "Authorization token missing or malformed"
         );
      }

      try {
         const data = await verifyToken(token);

         if (!data) {
            SendResponse.unauthorized(res, "invalid token");
         }

         const user = await AuthModel.aggregate([
            {
               $match: {
                  _id: new ObjectId(data.id as string),
               },
            },
            {
               $lookup: {
                  from: "users",
                  localField: "publicId",
                  foreignField: "userId",
                  as: "user",
               },
            },
            {
               $unwind: "$user",
            },
            {
               $project: {
                  _id: 0,
                  "user._id": 0,
                  "user.createdAt": 0,
                  phone_management: 0,
                  userId: 0,
                  phoneNumber: 0,
                  updatedAt: 0,
                  createdAt: 0,
                  publicId: 0,
                  role: 0,
                  "user.updatedAt": 0,
               },
            },
         ]);

         // `user` will be an array, so you might want to take the first element if expecting a single result
         const userData = user[0];
         // console.log(userData);

         if (!user) {
            SendResponse.unauthorized(res, "Invalid token");
         }

         res.locals.user = userData.user;

         // update last seen

         return next();
      } catch (error) {
         SendResponse.unauthorized(res, "Invalid token");
      }
   }

   public async authorizeRoles(
      req: Request,
      res: Response,
      next: NextFunction
   ) {
      const user = res.locals.user as any;

      if (user.role === "admin") {
         return next();
      }

      SendResponse.unauthorized(res, "Unauthorized");
   }

   public async ensureAuthenticated(
      req: Request,
      res: Response,
      next: NextFunction
   ) {
      if (req.isAuthenticated()) {
         return next();
      }

      res.status(401).json({ error: "You are not authenticated !!" });

      SendResponse.unauthorized(res, "You are not authenticated !!");
   }

   public async updateLastSeenMiddleware(
      req: Request,
      res: Response,
      next: NextFunction
   ) {
      if (res.locals.user) {
         const userId = res.locals.user.publicId;
         await AuthModel.updateOne(
            { publicId: userId },
            { lastSeenAt: new Date() }
         );
      }
      next();
   }
}

// Additional methods for loading user, checking admin rights, etc., can be added here

export default new AuthMiddleware();
