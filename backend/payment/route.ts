import { Router } from "express";
import PaymentController from "./controller";

const router = Router();

router.post("/charge-bank", PaymentController.chargeBankAccount);

export default router;
