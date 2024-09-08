import { Router } from "express";
// import authMiddleware from "../user/middleware";
import RestaurantController from "./controller";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../auth/middleware";
import SlugMiddleware from "../../middleware/slug.middleware";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);
router.param('publicId', SlugMiddleware.restaurantPublicId);

// middleware to validate user

// middleware to validate packageId

router.get("/", RestaurantController.all);
router.post("/", RestaurantController.create);
router.get("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.one);
router.put("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.update);

export default router;


