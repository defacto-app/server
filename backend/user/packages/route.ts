import { Router } from "express";
import authMiddleware from "../middleware";
import PackageController from "./controller";
import PackageMiddleware from "../../user/packages/middleware";

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

// middleware to validate packageId

router.get("/all", PackageController.all);
router.get("/create", PackageController.create);
router.get("/:packageId", PackageMiddleware.packageId, PackageController.one);
router.put("/:packageId", PackageMiddleware.packageId, PackageController.update);
router.delete(
	"/:packageId",
	PackageMiddleware.packageId,
	PackageController.delete,
);

export default router;
