import { Router } from "express";
// import authMiddleware from "../user/middleware";
import RestaurantController from "./controller";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../auth/middleware";
import RestaurantMiddleware from "../../middleware/restaurant.middleware";
import multer from "multer";
import AdminRestaurantMenuController from "./menu/controller";

const upload = multer({ dest: "uploads/" }); // Temporary location to store uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);
router.param("publicId", RestaurantMiddleware.restaurantPublicId);

// middleware to validate user

// middleware to validate packageId

router.get("/", RestaurantController.all);
router.post("/", RestaurantController.create);
router.get("/:publicId", RestaurantController.one);
router.put("/:publicId", RestaurantController.update);
router.delete("/:publicId", RestaurantController.delete);
router.post("/:publicId", upload.single("image"), RestaurantController.upload);

router.post("/menu/:publicId", AdminRestaurantMenuController.create);
router.get("/menu/:publicId", AdminRestaurantMenuController.all);

export default router;
