import { Router } from "express";
// import SlugMiddleware from "../middleware/slug.middleware";
import authMiddleware from "../../auth/middleware";
import RestaurantMiddleWare from "../../../middleware/restaurant.middleware";
import multer from "multer";
import AdminRestaurantMenuController from "./controller";

const upload = multer({ dest: "uploads/" }); // Temporary location to store uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);

router.param("menuId", RestaurantMiddleWare.menuPublicId);

router.get("/:menuId", AdminRestaurantMenuController.one);
router.put("/:menuId", AdminRestaurantMenuController.update);
router.post(
   "/:menuId",
   upload.single("image"),
   AdminRestaurantMenuController.upload
);


// all menu items

router.get("/", AdminRestaurantMenuController.allMenu);

export default router;
