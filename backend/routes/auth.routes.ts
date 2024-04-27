import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/login", AuthController.login);

router.post("/login", AuthController.login);

router.post("/register", AuthController.register);
router.post("/user-exists", AuthController.userExists);
router.get("/logout", AuthController.logout);
router.get("/ping", authMiddleware.validateUser, AuthController.ping);

export default router;
