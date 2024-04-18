import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware";

import SlugMiddleware from "../../middleware/slug.middleware";
import FileMiddleware from "../../middleware/file.middleware";
import TeamController from "../../controllers/admin/team.controller";

const router = Router();

router.use(authMiddleware.validateUser);

// Define a middleware for the 'slug' parameter
router.param("publicId", SlugMiddleware.teamPublicId);

router.get("/", TeamController.all);

router.get("/:publicId", TeamController.one);

router.post("/", TeamController.create);

router.put("/:publicId", TeamController.update);

router.post(
   "/:publicId/upload",
   FileMiddleware.upload,
    TeamController.upload
);


router.delete("/:publicId", TeamController.delete);






export default router;
