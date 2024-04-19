import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();
/**
 * @openapi
 * /login:
 *   post:
 *     description: Login route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post("/login", AuthController.login);

router.post("/login", AuthController.login);

router.post("/register", AuthController.register);
router.get("/logout", AuthController.logout);
router.get("/ping", authMiddleware.validateUser, AuthController.ping);

export default router;
