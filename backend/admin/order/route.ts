import { Router } from "express";

import authMiddleware from "../auth/middleware";
import AdminOrderController from "./controller";

const router = Router();

router.use(authMiddleware.validateAdmin);

// middleware to validate user

// middleware to validate packageId

router.get("/", AdminOrderController.all);
router.post("/", AdminOrderController.create)
router.post("/", AdminOrderController.create)

export default router;
