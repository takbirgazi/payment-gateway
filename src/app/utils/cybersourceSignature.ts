import crypto from "crypto";

export const signFields = (
    fields: Record<string, string>,
    signedFieldNames: string,
    secretKey: string
): string => {
    const dataToSign = signedFieldNames
        .split(",")
        .map(name => `${name}=${fields[name]}`)
        .join(",");

    // Cybersource secret key is used as a plain UTF-8 string,
    // not base64-decoded.
    return crypto
        .createHmac("sha256", secretKey)
        .update(dataToSign)
        .digest("base64");
};
