import { Router } from "express";
import authMiddleware from "../../auth/middleware";
import RestaurantMiddleWare from "../../../middleware/restaurant.middleware";
import multer from "multer";
import AdminRestaurantMenuController from "./controller";

const upload = multer({ dest: "uploads/" }); // Temporary location for uploaded files

const router = Router();

// Apply the middleware to all routes
router.use(authMiddleware.validateAdmin);

// Middleware to validate and fetch `menuId`
router.param("menuId", RestaurantMiddleWare.menuPublicId);

// All Menu Items (Paginated)
router.get("/", AdminRestaurantMenuController.allMenu);

// CRUD Operations for Menu Items
router.get("/:menuId", AdminRestaurantMenuController.one);
router.put("/:menuId", AdminRestaurantMenuController.update);
router.delete("/:menuId", AdminRestaurantMenuController.delete);
router.patch("/:menuId/restore", AdminRestaurantMenuController.restore);

// File Upload (Image Upload)
router.patch(
	"/:menuId/upload",
	upload.single("image"),
	AdminRestaurantMenuController.upload,
);
//
// Get Soft-Deleted Items
router.get("/deleted", AdminRestaurantMenuController.getDeleted);

// Bulk Actions
router.delete("/bulk", AdminRestaurantMenuController.bulkDelete); // Bulk soft delete
router.patch("/bulk/restore", AdminRestaurantMenuController.bulkRestore); // Bulk restore

// Custom Operations
router.patch(
	"/:menuId/toggle-availability",
	AdminRestaurantMenuController.toggleAvailability,
); // Toggle menu availability

export default router;
