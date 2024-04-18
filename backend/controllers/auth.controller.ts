import e, {NextFunction, Request, Response} from "express";
import UserModel from "../model/user.model";
import {generateToken} from "../services/jwt.service";
import passport from "./passport.controller";
import {supabase} from "../../config/supabase.config";

const AuthController = {
    async login(req: Request, res: Response, next: NextFunction): Promise<e.Response<any, Record<string, any>>> {
        try {
            const {email, password} = req.body;

            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return res.status(400).json({
                    message: "Failed to login",
                    error: error.message,
                });
            }

            return res.status(200).json({
                message: "User logged in",
                data: data,
            });
        } catch (e:any) {
            return res.status(500).json({
                message: "An unexpected error occurred",
                error: e.message,
            });
        }
    },

    async register(req: Request, res: Response): Promise<void> {
        // check if user exists

        try {
            res.status(200).json({
                message: "User created",
            });
        } catch (e) {
            res.status(500).json({
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
