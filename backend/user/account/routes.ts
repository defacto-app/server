import { Router } from "express";
import authMiddleware from "../../user/middleware";
import AccountController from "./controller";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);

// middleware to validate user

// middleware to validate packageId

router.patch("/", AccountController.updateAccountDetails);

router.patch("/update-email", AccountController.update_name_email);
router.patch("/verify-email-change", AccountController.verify_email_change);
/*router.get("/", AccountController.getAccountDetails);

router.get("/address", AccountController.all);
router.post("/address", AccountController.add);
router.delete("/:publicId/address",  AccountController.delete);*/


// get one order

export default router;

// router.param('packageId', SlugMiddleware.packageId);
