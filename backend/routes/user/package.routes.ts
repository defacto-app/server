import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import PackageController from "../../controllers/user/package.controller";
import SlugMiddleware from "../../middleware/slug.middleware";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);

// middleware to validate user

router.get("/all", PackageController.all);
router.post("/create", PackageController.create);
router.get("/:packageId", SlugMiddleware.packageId, PackageController.one);
router.put("/:packageId",SlugMiddleware.packageId, PackageController.update);
router.delete("/:packageId", SlugMiddleware.packageId, PackageController.delete);

export default router;
