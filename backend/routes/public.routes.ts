import { Router } from "express";
import ServiceController from "../controllers/service.controller";
import ProjectController from "../controllers/projects.controller";
import TeamController from "../controllers/team.controller";
import TestimonialController from "../controllers/testimonial.controller";
import EmailController from "../controllers/email.controller";

import ProjectMiddleware from "../middleware/slug.middleware";
import FileMiddleware from "../middleware/file.middleware";
import SlugMiddleware from "../middleware/slug.middleware";

const router = Router();

router.get("/team", TeamController.all);


router.get("/projects", ProjectController.all);
router.get("/projects/:slug", SlugMiddleware.projectSlug, ProjectController.one);

router.get("/services", ServiceController.all);

router.get("/services/:slug", SlugMiddleware.serviceSlug, ServiceController.one);




router.get("/testimonials", TestimonialController.all);
router.post("/contact", EmailController.contact);

export default router;
