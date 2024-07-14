import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../services/jwt.service";
import AuthModel from "../auth/model";

class AdminMiddleware {
}

export default new AdminMiddleware();
