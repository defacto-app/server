import { Router } from "express";
import PublicController from "../controllers/public.controller";

const router = Router();



router.get("/google-places", PublicController.google_api);
router.get("/place-details", PublicController.get_place_details);

export default router;