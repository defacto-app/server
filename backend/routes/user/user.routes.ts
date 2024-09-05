import { Router } from "express";
import authMiddleware from "../../user/middleware";
import UserController from "../../controllers/user/user.controller";
import AuthController from "../../auth/controller";

const router = Router();



router.post("/login", AuthController.phone_login);

export default router;
