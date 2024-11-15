import { Router } from "express";

import authMiddleware from "../admin/auth/middleware";

import Dashboard from "../controllers/admin/dashboard";

const router = Router();

router.use(authMiddleware.validateAdmin);

// Define a middleware for the 'slug' parameter

router.get("/", Dashboard.summary);

export default router;
