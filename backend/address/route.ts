import { Router } from "express";
import authMiddleware from "../user/middleware";

import AddressController from "./controller";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

router.get("/", AddressController.all);

export default router;
