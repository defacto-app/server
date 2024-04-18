import { Router } from "express";

import FileMiddleware from "../../middleware/file.middleware";
import ProjectController from "../../controllers/admin/project.controller";
import SlugMiddleware from "../../middleware/slug.middleware";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware.validateUser);

// Define a middleware for the 'slug' parameter
router.param("slug", SlugMiddleware.projectSlug);

router.get("/", ProjectController.all);
router.post("/", ProjectController.create);

router.get("/:slug",ProjectController.one);

router.put("/:slug",ProjectController.update);

router.post(
   "/:slug/upload",

   FileMiddleware.upload,
   ProjectController.upload
);

router.delete("/:slug",  ProjectController.delete);
export default router;
