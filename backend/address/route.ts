import { Router } from "express";
import authMiddleware from "../user/middleware";
import AddressMiddleware from "./middleware";

import AddressController from "./controller";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);
router.param('publicId', AddressMiddleware.addressPublicId);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

router.get("/", AddressController.all);
router.post("/", AddressController.add);
router.delete("/:publicId",  AddressController.delete);


export default router;
