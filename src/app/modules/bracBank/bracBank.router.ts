import { Router } from "express";
import { PaymentController } from "./bracBank.controller";


const router = Router();

router.post("/create", PaymentController.create);
router.post("/success", PaymentController.success);
router.post("/cancel", PaymentController.cancel);



export const BracBankRoutes = router;