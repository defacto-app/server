import { Router } from "express";

import authMiddleware from "../auth/middleware";
import AdminOrderController from "./controller";
import OrderMiddleware from "../../middleware/order.middleware";

const router = Router();

router.use(authMiddleware.validateAdmin);

router.param("orderId", OrderMiddleware.orderId);

// middleware to validate user

// middleware to validate packageId

router.get("/", AdminOrderController.all);
router.post("/", AdminOrderController.create);
router.get(
	"/:orderId",
	OrderMiddleware.getDriverDetails,
	AdminOrderController.one,
);

router.get(
	"/:orderId/restaurant",
	OrderMiddleware.getRestaurantDetails,
	OrderMiddleware.getDriverDetails,
	AdminOrderController.restaurant,
);
router.patch("/:orderId/assign-driver", AdminOrderController.assignDriver);
router.patch("/:orderId/status", AdminOrderController.updateStatus);

export default router;
