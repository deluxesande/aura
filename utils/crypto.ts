import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    // Note: If using hex string from openssl, length is 64 chars (32 bytes).
    // If using raw string, ensure it fits the algorithm requirements.
    // For simplicity below, we assume a hex string key.
    console.warn(
        "Ensure ENCRYPTION_KEY is set and is a 64-char hex string (32 bytes)."
    );
}

const keyBuffer = () => Buffer.from(ENCRYPTION_KEY, "hex");

// Encrypts with authenticated AES-256-GCM. Output: iv:authTag:ciphertext (all hex).
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(12); // 96-bit nonce, recommended for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer(), iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(text: string): string {
    const parts = text.split(":");

    // Reject anything that isn't a recognised layout: 2 parts (legacy CBC) or
    // 3 parts (GCM). Otherwise Buffer.from would throw opaquely or silently
    // mis-parse a malformed value.
    if (parts.length !== 2 && parts.length !== 3) {
        throw new Error("Invalid ciphertext format");
    }

    // Legacy CBC format (iv:ciphertext) — kept so data encrypted before the
    // GCM migration still decrypts. New writes always use GCM (3 parts).
    if (parts.length === 2) {
        const iv = Buffer.from(parts[0], "hex");
        const encryptedText = Buffer.from(parts[1], "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer(), iv);
        return Buffer.concat([
            decipher.update(encryptedText),
            decipher.final(),
        ]).toString();
    }

    // GCM format: iv:authTag:ciphertext — verifies integrity on decrypt.
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        keyBuffer(),
        Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]).toString("utf8");
}
