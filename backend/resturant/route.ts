import { Router } from "express";
// import authMiddleware from "../user/middleware";
import RestaurantController from "./controller";

const router = Router();

// Apply the middleware to all routes
// router.use(authMiddleware.validateUser);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

// middleware to validate packageId

router.get("/all", RestaurantController.all);

export default router;
