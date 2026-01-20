import { Request, Response } from "express";
import { PaymentService } from "./bracBank.service";

export class PaymentController {
    static create(req: Request, res: Response) {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ message: "Amount and currency required" });
        }

        const paymentForm = PaymentService.createPayment({
            amount,
            currency
        });

        res.json(paymentForm);
    }

    static success(_req: Request, res: Response) {
        res.send("Payment Successful");
    }

    static cancel(_req: Request, res: Response) {
        res.send("Payment Cancelled");
    }
}
