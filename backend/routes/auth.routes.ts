import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/phone-login", AuthController.phone_login);
router.post("/phone-register", AuthController.phone_register);
router.post("/confirm-phone-number", AuthController.confirm_phone_number);
router.post("/phone-number-exist", AuthController.phone_number_exist);

//
router.post("/email-login", AuthController.email_login);
router.post("/email-register", AuthController.email_register);
router.post("/user-exists", AuthController.email_exist);

//
router.get("/logout", AuthController.logout);
router.get("/ping", authMiddleware.validateUser, AuthController.ping);

export default router;
