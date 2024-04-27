import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import UserController from "../../controllers/user/user.controller";

const router = Router();

router.post( "/update-user", authMiddleware.validateUser, UserController.updateUser);



export default router;
