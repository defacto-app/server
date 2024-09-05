import { Router } from "express";
import AuthController from "./controller";
import authMiddleware from "../user/middleware";
import packageMiddleware from "../user/packages/middleware";

const router = Router();

router.post("/phone-login", AuthController.phone_login);
router.post("/confirm-phone-login", AuthController.confirm_phone_login);

//
router.post("/email-login", AuthController.email_login);
router.post("/email-register", AuthController.email_register);
router.post("/email-exists", AuthController.email_exist);
router.get("/verify/email/:token", AuthController.email_confirm);

//

router.get("/logout", AuthController.logout);
router.get(
	"/ping",
	authMiddleware.validateUser,
	packageMiddleware.userPackages,
	AuthController.ping,
);

export default router;
