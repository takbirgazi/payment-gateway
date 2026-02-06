import crypto from "crypto";

/**
 * Matches PHP security.php: buildDataToSign + signData
 * - Builds "field1=value1,field2=value2,..." in order of signed_field_names
 * - HMAC-SHA256 with secret key as plain string (not base64 decoded)
 * - Returns base64 of raw HMAC output
 */
export function signFields(
    params: Record<string, string>,
    signedFieldNames: string,
    secretKey: string
): string {
    const dataToSign = signedFieldNames
        .split(",")
        .map((field) => {
            const name = field.trim();
            const value = params[name] ?? "";
            return `${name}=${value}`;
        })
        .join(",");

    // PHP: base64_encode(hash_hmac('sha256', $data, $secretKey, true))
    // Secret key used as plain string
    return crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("base64");
}

/**
 * Verify signature (for receipt page) - recompute and compare
 */
export function verifySignature(
    params: Record<string, string>,
    signedFieldNames: string,
    secretKey: string
): boolean {
    const receivedSignature = params.signature ?? "";
    if (!receivedSignature) return false;

    const paramsWithoutSignature = { ...params };
    delete paramsWithoutSignature.signature;

    const expected = signFields(
        paramsWithoutSignature,
        signedFieldNames,
        secretKey
    );
    return receivedSignature === expected;
}
