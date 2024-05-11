import { Router } from "express";
import AuthController from "../auth/controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/phone-login", AuthController.phone_login);
router.post("/confirm-phone-login", AuthController.confirm_phone_login);

//
router.post("/email-login", AuthController.email_login);
router.post("/email-register", AuthController.email_register);
router.post("/email-exists", AuthController.email_exist);
router.post("/email-confirm", AuthController.email_confirm);

//

// admin routes
router.post("/admin-login", AuthController.admin_login);


router.get("/logout", AuthController.logout);
router.get("/ping", authMiddleware.validateUser, AuthController.ping);

router.get("/admin-ping", authMiddleware.validateAdmin, AuthController.ping);

export default router;
