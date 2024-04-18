import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware";
import ServiceController from "../../controllers/admin/service.controller";

import SlugMiddleware from "../../middleware/slug.middleware";
import ProjectController from "../../controllers/admin/project.controller";
import FileMiddleware from "../../middleware/file.middleware";

const router = Router();

router.use(authMiddleware.validateUser);

// Define a middleware for the 'slug' parameter
router.param("slug", SlugMiddleware.serviceSlug);

router.get("/", ServiceController.all);

router.get("/:slug", ServiceController.one);

router.post("/", ServiceController.create);

router.put("/:slug", ServiceController.update);

router.post(
   "/:slug/upload",
   SlugMiddleware.serviceSlug,
   FileMiddleware.upload,
   ServiceController.upload
);

router.delete("/:slug", ServiceController.delete);

export default router;
