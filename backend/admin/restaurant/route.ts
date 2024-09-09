import { Router } from "express";
// import authMiddleware from "../user/middleware";
import RestaurantController from "./controller";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../auth/middleware";
import SlugMiddleware from "../../middleware/slug.middleware";
import multer from "multer";

const upload = multer({ dest: 'uploads/' }); // Temporary location to store uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);
router.param('publicId', SlugMiddleware.restaurantPublicId);

// middleware to validate user

// middleware to validate packageId

router.get("/", RestaurantController.all);
router.post("/", RestaurantController.create);
router.get("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.one);
router.put("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.update);
router.delete("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.delete);
router.post("/:publicId", SlugMiddleware.restaurantPublicId, upload.single("image"),RestaurantController.upload);

export default router;


