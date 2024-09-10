import { Router } from "express";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../../auth/middleware";
import RestaurantMiddleWare from "../../../middleware/slug.middleware";
import multer from "multer";
import AdminRestaurantMenuController from "./controller";

const upload = multer({ dest: "uploads/" }); // Temporary location to store uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);
router.param('publicId', RestaurantMiddleWare.restaurantPublicId);

router.param('menuId', RestaurantMiddleWare.restaurantPublicId);



router.post("/:publicId", AdminRestaurantMenuController.create);
router.get("/:publicId",  AdminRestaurantMenuController.all);

router.get("/:menuId", RestaurantMiddleWare.menuPublicId, AdminRestaurantMenuController.one);

/*
router.get("/", RestaurantController.all);

router.get("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.one);
router.put("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.update);
router.delete("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.delete);
router.post("/:publicId", SlugMiddleware.restaurantPublicId, upload.single("image"),RestaurantController.upload);
*/

export default router;
