import express, { Router } from "express";
import authMiddleware from "../user/middleware";
import OrderController from "./controller";

const customBodyParser = express.json({ limit: '10mb' });
const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);

// middleware to validate user

// middleware to validate packageId

router.get("/",  OrderController.all);
router.post("/restaurant", OrderController.restaurant);
router.post("/package-delivery", customBodyParser, OrderController.package_delivery);

// get one order




export default router;


// router.param('packageId', SlugMiddleware.packageId);
