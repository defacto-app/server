import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import { generateToken } from "../services/jwt.service";
import passport from "./passport.controller";

const AuthController = {
   async login(req: Request, res: Response, next: NextFunction): Promise<void> {
      passport.authenticate(
         "local",
         (err: any, user: any, info: { message: any }) => {
            if (err) {
               return next(err); // will generate a 500 error
            }
            if (!user) {
               return res
                  .status(401)
                  .send({ success: false, message: info.message });
            }
            req.login(user, (loginErr) => {
               if (loginErr) {
                  return next(loginErr);
               }
               // User has been logged in, you can now return a response or redirect
               console.log("Logged in user:", user); // Log the user details

               const token = generateToken(user!);

               return res.status(200).send({
                  success: true,
                  user,
                  message: "User login successfully",
                  token,
               });
            });
         }
      )(req, res, next);
   },

   async register(req: Request, res: Response): Promise<void> {
      // check if user exists

      const userExists = await UserModel.findOne({
         email: req.body.email,
      });

      if (userExists) {
         res.status(401).json({ message: "User already exists" });

         return;
      }

      const user = new UserModel({
         email: req.body.email,
         password: req.body.password,
      });

      try {
         await user.save();
         res.status(200).json({
            message: "User registered",
         });
      } catch (e) {
         res.status(500).json({
            message: "Error registering user",
            error: e,
         });
      }
   },

   async ping(req: Request, res: Response): Promise<void> {
      const user = res.locals.user;

      try {
         res.status(200).json(user);
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default AuthController;
