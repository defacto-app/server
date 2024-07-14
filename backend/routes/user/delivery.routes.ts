import { Router } from "express";
import authMiddleware from "../../user/middleware";
import UserController from "../../controllers/user/user.controller";

const router = Router();

router.put(
	"/update-user",
	authMiddleware.validateUser,
	UserController.updateUser,
);

export default router;
