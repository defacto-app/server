import { Router } from "express";
import authMiddleware from "./middleware";
import UserController from "../controllers/user/user.controller";

const router = Router();

router.put(
	"/update-user",
	authMiddleware.validateUser,
	UserController.updateUser,
);







export default router;
