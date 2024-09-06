import { Router } from "express";
// import authMiddleware from "../user/middleware";
import RestaurantController from "./controller";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../auth/middleware";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

// middleware to validate packageId

router.get("/", RestaurantController.all);
// router.get("/:slug", SlugMiddleware.restaurantSlug, RestaurantController.one);

export default router;
