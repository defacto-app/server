import { Router } from "express";
// import authMiddleware from "../user/middleware";
import RestaurantController from "./controller";
import RestaurantMiddleware from "../middleware/restaurant.middleware";

const router = Router();

// Apply the middleware to all routes
// router.use(authMiddleware.validateUser);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

// middleware to validate packageId

router.get("/", RestaurantController.all);
router.get("/:slug", RestaurantMiddleware.restaurantSlug, RestaurantController.one);

export default router;
