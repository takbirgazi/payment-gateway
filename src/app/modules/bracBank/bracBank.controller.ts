import { Request, Response } from "express";
import { PaymentService } from "./bracBank.service";
import { cybersourceConfig } from "../../config/cybersource.config";
import crypto from "crypto";

const PAYMENT_CSS = `
a { font-size: 1.0em; text-decoration: none; }
input[type=submit] { margin-top: 10px; }
span { font-weight: bold; width: 350px; display: inline-block; }
.fieldName { width: 400px; font-weight: bold; vertical-align: top; }
.fieldValue { width: 400px; font-weight: normal; vertical-align: top; }
`;

/**
 * GET Payment form (like payment_form.php)
 */
export function getPaymentForm(_req: Request, res: Response) {
    const transactionUuid = crypto.randomUUID();
    const signedDateTime = new Date()
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
    const ref = String(Date.now());

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Secure Acceptance - Payment Form Example</title>
    <style>${PAYMENT_CSS}</style>
</head>
<body>
<form id="payment_form" action="/api/v1/brac/confirmation" method="post">
    <input type="hidden" name="access_key" value="${cybersourceConfig.accessKey}">
    <input type="hidden" name="profile_id" value="${cybersourceConfig.profileId}">
    <input type="hidden" name="transaction_uuid" value="${transactionUuid}">
    <input type="hidden" name="signed_field_names" value="override_custom_receipt_page,auth_trans_ref_no,access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency">
    <input type="hidden" name="unsigned_field_names" value="override_custom_cancel_page,bill_to_forename,bill_to_surname,bill_to_address_line1,bill_to_address_state,bill_to_address_city,bill_to_address_country,bill_to_email,bill_to_address_postal_code">
    <input type="hidden" name="signed_date_time" value="${signedDateTime}">
    <input type="hidden" name="locale" value="en">
    <fieldset>
        <legend>Payment Details</legend>
        <div id="paymentDetailsSection" class="section">
            <span>transaction_type:</span><input type="text" name="transaction_type" value="sale" size="25"><br/>
            <span>reference_number:</span><input type="text" name="reference_number" value="${ref}" size="25"><br/>
            <span>auth_trans_ref_no:</span><input type="text" name="auth_trans_ref_no" value="${ref}" size="25"><br/>
            <span>amount:</span><input type="text" name="amount" value="100.00" size="25"><br/>
            <span>currency:</span><input type="text" name="currency" value="BDT" size="25"><br/>
            <input type="hidden" name="bill_to_forename" value="NOREAL"/>
            <input type="hidden" name="bill_to_surname" value="NAME"/>
            <input type="hidden" name="bill_to_address_line1" value="1295 Charleston Road"/>
            <input type="hidden" name="bill_to_address_state" value="CA"/>
            <input type="hidden" name="bill_to_address_city" value="Mountain View"/>
            <input type="hidden" name="bill_to_address_country" value="US"/>
            <input type="hidden" name="bill_to_email" value="null@cybersource.com"/>
            <input type="hidden" name="bill_to_address_postal_code" value="94043"/>
            <input type="hidden" name="override_custom_receipt_page" value="${cybersourceConfig.successUrl}"/>
            <input type="hidden" name="override_custom_cancel_page" value="${cybersourceConfig.cancelUrl}"/>
        </div>
    </fieldset>
    <input type="submit" id="submit" name="submit" value="Submit"/>
</form>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
}

/**
 * POST Confirmation (like payment_confirmation.php) - receives form, adds signature, shows form that posts to Cybersource
 */
export function postConfirmation(req: Request, res: Response) {
    const params: Record<string, string> = {};
    const raw = { ...req.body } as Record<string, unknown>;
    for (const [name, value] of Object.entries(raw)) {
        params[name] = value != null ? String(value) : "";
    }

    const signed = PaymentService.signParams(params);
    const payUrl = cybersourceConfig.payUrl;

    const hiddenInputs = Object.entries(signed)
        .map(
            ([name, value]) =>
                `<input type="hidden" id="${escapeHtml(name)}" name="${escapeHtml(name)}" value="${escapeHtml(value)}"/>`
        )
        .join("\n");

    const reviewRows = Object.entries(signed)
        .map(
            ([name, value]) =>
                `<div><span class="fieldName">${escapeHtml(name)}</span><span class="fieldValue">${escapeHtml(value)}</span></div>`
        )
        .join("\n");

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Secure Acceptance - Payment Form Example</title>
    <style>${PAYMENT_CSS}</style>
</head>
<body>
<form id="payment_confirmation" action="${escapeHtml(payUrl)}" method="post">
<fieldset id="confirmation">
    <legend>Review Payment Details</legend>
    <div>
        ${reviewRows}
    </div>
</fieldset>
    ${hiddenInputs}
<input type="submit" id="submit" value="Confirm"/>
</form>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
}

/**
 * GET/POST Receipt (like receipt.php) - Cybersource redirects here; verify signature and show result
 */
export function getReceipt(req: Request, res: Response) {
    const params: Record<string, string> = {};
    const raw = { ...req.query } as Record<string, unknown>;
    for (const [name, value] of Object.entries(raw)) {
        params[name] = value != null ? String(value) : "";
    }
    sendReceiptHtml(res, params);
}

export function postReceipt(req: Request, res: Response) {
    const params: Record<string, string> = {};
    const raw = { ...req.body } as Record<string, unknown>;
    for (const [name, value] of Object.entries(raw)) {
        params[name] = value != null ? String(value) : "";
    }
    sendReceiptHtml(res, params);
}

function sendReceiptHtml(res: Response, params: Record<string, string>) {
    const verified = PaymentService.verifyReceiptSignature(params);

    const rows = Object.entries(params)
        .map(
            ([name, value]) =>
                `<span>${escapeHtml(name)}</span><input type="text" name="${escapeHtml(name)}" size="50" value="${escapeHtml(value)}" readonly="true"/><br/>`
        )
        .join("\n");

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Secure Acceptance - Receipt</title>
    <style>${PAYMENT_CSS}</style>
</head>
<body>
<fieldset id="response">
    <legend>Receipt</legend>
    <div>
        <form id="receipt">
            ${rows}
            <span>Signature Verified:</span><input type="text" name="verified" size="50" value="${verified ? "True" : "False"}" readonly="true"/><br/>
        </form>
    </div>
</fieldset>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// --- API endpoints (existing) ---

export class PaymentController {
    static create(req: Request, res: Response) {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res
                .status(400)
                .json({ message: "Amount and currency required" });
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
