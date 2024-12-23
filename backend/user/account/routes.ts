import { Router } from "express";
import authMiddleware from "../../user/middleware";
import AccountController from "./controller";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);

// middleware to validate user

// middleware to validate packageId

router.patch("/", AccountController.updateAccountDetails);
router.patch("/update-phone-number", AccountController.update_phone_number);
router.patch("/verify-phone-number", AccountController.verify_phone_number);

router.patch("/update-email", AccountController.update_name_email);
router.patch("/verify-email-change", AccountController.verify_email_change);


// get one order

export default router;

// router.param('packageId', SlugMiddleware.packageId);
