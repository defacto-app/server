import { Router } from "express";
// import authMiddleware from "../user/middleware";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../auth/middleware";
import AdminUserController from "./controller";

const router = Router();

router.use(authMiddleware.validateAdmin);

// middleware to validate user

// middleware to validate packageId

router.get("/", AdminUserController.all);
router.delete("/:userId", AdminUserController.delete);

export default router;
