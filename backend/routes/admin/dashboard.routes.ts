import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware";

import SlugMiddleware from "../../middleware/slug.middleware";
import FileMiddleware from "../../middleware/file.middleware";
import DashboardController from "../../controllers/admin/dashboard.controller";

const router = Router();

router.use(authMiddleware.validateUser);

// Define a middleware for the 'slug' parameter

router.get("/", DashboardController.all);







export default router;
