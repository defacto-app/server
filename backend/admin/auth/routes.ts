import { Router } from "express";
import AdminAuthController from "./controller";
import authMiddleware from "../../admin/auth/middleware";

const router = Router();

// admin routes
router.post("/login", AdminAuthController.admin_login);
router.post("/send-otp", AdminAuthController.send_otp);
router.get("/ping", authMiddleware.validateAdmin, AdminAuthController.ping);




export default router;
