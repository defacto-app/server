import { Router } from "express";

import EmailController from "../controllers/email.controller";


const router = Router();


router.get("/verify-email", EmailController.verify_email);

export default router;
