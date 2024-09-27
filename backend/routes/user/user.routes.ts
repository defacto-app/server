import { Router } from "express";

import AuthController from "../../auth/controller";

const router = Router();



router.post("/login", AuthController.phone_login);




export default router;
