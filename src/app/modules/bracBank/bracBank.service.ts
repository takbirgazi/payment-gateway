import crypto from "crypto";
import { cybersourceConfig } from "../../config/cybersource.config";
import { signFields } from "../../utils/cybersourceSignature";
import { BILLING_INFO } from "./bracBank.constants";
import { CreatePaymentDTO, CyberSourceForm } from "./bracBank.types";

export class PaymentService {
    static createPayment(payload: CreatePaymentDTO): CyberSourceForm {
        const signedDateTime = new Date()
            .toISOString()
            .replace(/\.\d{3}Z$/, "Z");

        const referenceNumber = `ORD-${Date.now()}`;

        const fields: Record<string, string> = {
            access_key: cybersourceConfig.accessKey,
            profile_id: cybersourceConfig.profileId,
            transaction_uuid: crypto.randomUUID(),
            signed_date_time: signedDateTime,
            locale: "en",
            transaction_type: "sale",
            reference_number: referenceNumber,
            auth_trans_ref_no: referenceNumber,
            amount: payload.amount,
            currency: payload.currency,

            override_custom_receipt_page: cybersourceConfig.successUrl,
            override_custom_cancel_page: cybersourceConfig.cancelUrl,

            ...BILLING_INFO
        };

        const signedFieldNames =
            "access_key,profile_id,transaction_uuid,signed_date_time,locale," +
            "transaction_type,reference_number,amount,currency," +
            "auth_trans_ref_no,override_custom_receipt_page," +
            "bill_to_forename,bill_to_surname,bill_to_address_line1," +
            "bill_to_address_city,bill_to_address_state," +
            "bill_to_address_country,bill_to_address_postal_code," +
            "bill_to_email";

        fields.signed_field_names = signedFieldNames;

        fields.signature = signFields(
            fields,
            signedFieldNames,
            cybersourceConfig.secretKey
        );

        return {
            payUrl: cybersourceConfig.payUrl,
            fields
        };
    }
}
