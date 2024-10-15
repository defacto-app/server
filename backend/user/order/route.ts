import { Router } from "express";
import authMiddleware from "../middleware";
import OrderController from "./controller";


const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);
// router.param('packageId', SlugMiddleware.packageId);

router.post("/restaurants", OrderController.createRestaurantOrder);

/*
router.get("/restaurants", OrderController.allRestaurant);
router.get("/packages", OrderController.allPackages);
router.post("/packages", OrderController.createPackages);*/

export default router;
