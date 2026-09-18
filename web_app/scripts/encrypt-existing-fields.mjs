#!/usr/bin/env node
/**
 * One-off backfill: encrypt plaintext countdowns.title, users.email, and
 * users.username. Safe to re-run — skips values that already start with enc:v1:.
 * Keep this envelope in sync with src/lib/server/fieldCrypto.ts.
 *
 * Usage (from web_app): node scripts/encrypt-existing-fields.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCipheriv, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const KEY_BYTES = 32;

function loadEnvLocal() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "../.env.local");
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function getKey() {
  const raw = process.env["FIELD_ENCRYPTION_KEY"];
  if (!raw) throw new Error("Missing FIELD_ENCRYPTION_KEY");
  const key = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error("FIELD_ENCRYPTION_KEY must be 32 bytes (64 hex chars or base64)");
  }
  return key;
}

function isEncrypted(value) {
  return typeof value === "string" && value.startsWith(PREFIX);
}

function encryptField(plaintext, userId, key) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(userId, "utf8"));
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

loadEnvLocal();

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) throw new Error("Missing DATABASE_URL");

const key = getKey();
const sql = neon(databaseUrl);

const titles = await sql`SELECT id, user_id, title FROM countdowns`;
let titlesUpdated = 0;
for (const row of titles) {
  if (isEncrypted(row.title)) continue;
  const title = encryptField(row.title, row.user_id, key);
  await sql`UPDATE countdowns SET title = ${title} WHERE id = ${row.id}`;
  titlesUpdated += 1;
}

const users = await sql`SELECT id, email, username FROM users`;
let emailsUpdated = 0;
let usernamesUpdated = 0;
for (const row of users) {
  const email = isEncrypted(row.email) ? null : encryptField(row.email, row.id, key);
  const username =
    row.username && !isEncrypted(row.username) ? encryptField(row.username, row.id, key) : undefined;

  if (email && username !== undefined) {
    await sql`UPDATE users SET email = ${email}, username = ${username} WHERE id = ${row.id}`;
    emailsUpdated += 1;
    usernamesUpdated += 1;
  } else if (email) {
    await sql`UPDATE users SET email = ${email} WHERE id = ${row.id}`;
    emailsUpdated += 1;
  } else if (username !== undefined) {
    await sql`UPDATE users SET username = ${username} WHERE id = ${row.id}`;
    usernamesUpdated += 1;
  }
}

console.log(
  `encrypted ${titlesUpdated}/${titles.length} titles, ${emailsUpdated}/${users.length} emails, ${usernamesUpdated}/${users.length} usernames`,
);
