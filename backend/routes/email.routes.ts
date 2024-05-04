import { Router } from "express";

import EmailController from "../controllers/email.controller";


const router = Router();


router.post("/verify-email", EmailController.verify_email);

export default router;
