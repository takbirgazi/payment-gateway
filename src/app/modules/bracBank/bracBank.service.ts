import crypto from "crypto";
import { cybersourceConfig } from "../../config/cybersource.config";
import {
    signFields,
    verifySignature
} from "../../utils/cybersourceSignature";
import { BILLING_INFO } from "./bracBank.constants";
import { CreatePaymentDTO, CyberSourceForm } from "./bracBank.types";

// Exact order from PHP payment_form.php
const SIGNED_FIELD_NAMES =
    "override_custom_receipt_page,auth_trans_ref_no,access_key,profile_id," +
    "transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time," +
    "locale,transaction_type,reference_number,amount,currency";

const UNSIGNED_FIELD_NAMES =
    "override_custom_cancel_page,bill_to_forename,bill_to_surname," +
    "bill_to_address_line1,bill_to_address_state,bill_to_address_city," +
    "bill_to_address_country,bill_to_email,bill_to_address_postal_code";

export class PaymentService {
    /**
     * Create payment form data (API) - same as PHP flow but from payload
     */
    static createPayment(payload: CreatePaymentDTO): CyberSourceForm {
        const signedDateTime = new Date()
            .toISOString()
            .replace(/\.\d{3}Z$/, "Z");
        const referenceNumber = String(Date.now());
        const authTransRefNo = referenceNumber;

        const fields: Record<string, string> = {
            access_key: cybersourceConfig.accessKey,
            profile_id: cybersourceConfig.profileId,
            transaction_uuid: crypto.randomUUID(),
            signed_field_names: SIGNED_FIELD_NAMES,
            unsigned_field_names: UNSIGNED_FIELD_NAMES,
            signed_date_time: signedDateTime,
            locale: "en",
            transaction_type: "sale",
            reference_number: referenceNumber,
            auth_trans_ref_no: authTransRefNo,
            amount: String(payload.amount),
            currency: payload.currency,
            override_custom_receipt_page: cybersourceConfig.successUrl,
            override_custom_cancel_page: cybersourceConfig.cancelUrl,
            ...BILLING_INFO
        };

        fields.signature = signFields(
            fields,
            SIGNED_FIELD_NAMES,
            cybersourceConfig.secretKey
        );

        return {
            payUrl: cybersourceConfig.payUrl,
            fields
        };
    }

    /**
     * Add signature to params (for confirmation page - like PHP payment_confirmation.php)
     */
    static signParams(params: Record<string, string>): Record<string, string> {
        const signedFieldNames =
            params.signed_field_names ?? SIGNED_FIELD_NAMES;
        const signed = { ...params };
        signed.signature = signFields(
            params,
            signedFieldNames,
            cybersourceConfig.secretKey
        );
        return signed;
    }

    /**
     * Verify signature (for receipt page - like PHP receipt.php)
     */
    static verifyReceiptSignature(params: Record<string, string>): boolean {
        const signedFieldNames = params.signed_field_names ?? "";
        if (!signedFieldNames) return false;
        return verifySignature(
            params,
            signedFieldNames,
            cybersourceConfig.secretKey
        );
    }
}
