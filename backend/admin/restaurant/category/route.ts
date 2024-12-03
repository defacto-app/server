import RestaurantMiddleware from "../../../middleware/restaurant.middleware";
import AdminCategoryController from "./controller";
import { Router } from "express";

const router = Router();

router.get("/search", AdminCategoryController.search);

router.post("/", AdminCategoryController.create);

router.get("/", AdminCategoryController.all);

router.put(
	"/:publicId",
	RestaurantMiddleware.categoryPublicId,
	AdminCategoryController.update,
);

router.delete(
	"/:publicId",
	RestaurantMiddleware.categoryPublicId,
	AdminCategoryController.delete,
);

export default router;
