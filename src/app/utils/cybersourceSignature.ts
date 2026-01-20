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

    return crypto
        .createHmac("sha256", Buffer.from(secretKey, "base64"))
        .update(dataToSign)
        .digest("base64");
};
