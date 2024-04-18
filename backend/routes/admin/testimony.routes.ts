import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware";

import SlugMiddleware from "../../middleware/slug.middleware";
import FileMiddleware from "../../middleware/file.middleware";
import TestimonyController from "../../controllers/admin/testify.controller";

const router = Router();

router.use(authMiddleware.validateUser);

// Define a middleware for the 'slug' parameter
router.param("publicId", SlugMiddleware.testimonyPublicId);

router.get("/", TestimonyController.all);

router.get("/:publicId", TestimonyController.one);

router.post("/", TestimonyController.create);

router.put("/:publicId", TestimonyController.update);

router.post(
   "/:publicId/upload",
   SlugMiddleware.serviceSlug,
   FileMiddleware.upload,
    TestimonyController.upload
);

router.delete("/:publicId", TestimonyController.delete);

export default router;
