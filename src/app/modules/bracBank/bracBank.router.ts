import { Router } from "express";
import {
    PaymentController,
    getPaymentForm,
    postConfirmation,
    getReceipt,
    postReceipt
} from "./bracBank.controller";

const router = Router();

// PHP flow: form -> confirmation -> Cybersource -> receipt
router.get("/form", getPaymentForm);
router.post("/confirmation", postConfirmation);
router.get("/receipt", getReceipt);
router.post("/receipt", postReceipt);

// API
router.post("/create", PaymentController.create);
router.post("/success", PaymentController.success);
router.post("/cancel", PaymentController.cancel);

export const BracBankRoutes = router;
