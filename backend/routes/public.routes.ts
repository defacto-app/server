import { Router } from "express";
import PublicController from "../controllers/public.controller";

const router = Router();



router.get("/google-places", PublicController.google_api);

export default router;