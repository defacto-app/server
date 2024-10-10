import { Router } from "express";
import PaymentController from "./controller";

const router = Router();

router.post("/card-payment", PaymentController.cardPayment);
router.post("/verify-transaction", PaymentController.verifyTransaction);
router.post("/webhook", PaymentController.webhook);



export default router;
