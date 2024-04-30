import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware";

import DashboardController from "../../controllers/admin/dashboard.controller";

const router = Router();

router.use(authMiddleware.validateAdmin);

// Define a middleware for the 'slug' parameter

router.get("/", DashboardController.all_users);

export default router;
