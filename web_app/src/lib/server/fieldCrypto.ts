import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_BYTES = 32;

let cachedKey: Buffer | undefined;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env["FIELD_ENCRYPTION_KEY"];
  if (!raw) throw new Error("Missing FIELD_ENCRYPTION_KEY");

  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    key = Buffer.from(raw, "base64");
  }

  if (key.length !== KEY_BYTES) {
    throw new Error("FIELD_ENCRYPTION_KEY must be 32 bytes (64 hex chars or base64)");
  }

  cachedKey = key;
  return key;
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

export function encryptField(plaintext: string, userId: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(userId, "utf8"));
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptField(value: string, userId: string): string {
  if (!isEncrypted(value)) return value;

  const key = getKey();
  const payload = Buffer.from(value.slice(PREFIX.length), "base64url");
  if (payload.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Encrypted field is truncated");
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(Buffer.from(userId, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
