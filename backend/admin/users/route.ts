import { Router } from "express";

import authMiddleware from "../auth/middleware";
import AdminUserController from "./controller";

const router = Router();

router.use(authMiddleware.validateAdmin);

// middleware to validate user

// middleware to validate packageId

router.get("/", AdminUserController.all);
router.post("/", AdminUserController.create);
router.delete("/:userId", AdminUserController.delete);
router.get("/:userId", AdminUserController.one);
router.patch("/:userId", AdminUserController.update);

export default router;
