import { Router } from "express";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../../auth/middleware";
import RestaurantMiddleWare from "../../../middleware/restaurant.middleware";
import multer from "multer";
import AdminRestaurantMenuController from "./controller";
import RestaurantController from "../../../restaurant/controller";

const upload = multer({ dest: "uploads/" }); // Temporary location to store uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);

router.param('menuId', RestaurantMiddleWare.menuPublicId);



// router.post("/:publicId", AdminRestaurantMenuController.create);
// router.get("/:publicId",  AdminRestaurantMenuController.all);

router.get("/:menuId",  AdminRestaurantMenuController.one);
router.put("/:menuId",  AdminRestaurantMenuController.update);
router.post("/:menuId",  upload.single("image"),AdminRestaurantMenuController.upload);

/*
router.get("/", RestaurantController.all);

router.get("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.one);
router.put("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.update);
router.delete("/:publicId", SlugMiddleware.restaurantPublicId, RestaurantController.delete);
*/

export default router;
