import { Router } from "express";
import authMiddleware from "../middleware";
import PackageController from "./controller";
import PackageMiddleware from "../../user/packages/middleware";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // Temporary location to store uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateUser);
// router.param('packageId', SlugMiddleware.packageId);

// middleware to validate user

// middleware to validate packageId

router.get("/", PackageController.all);
router.post("/", PackageController.create);
router.post("/", upload.single("package_image"), PackageController.create);
router.get("/:packageId", PackageMiddleware.packageId, PackageController.one);
router.put("/:packageId", PackageMiddleware.packageId, PackageController.update);
router.delete(
	"/:packageId",
	PackageMiddleware.packageId,
	PackageController.delete,
);


export default router;
