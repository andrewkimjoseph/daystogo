#!/usr/bin/env node
/**
 * Nitro stamps Cache-Control: immutable on every /assets/* response, including
 * 404s that fall through to the SSR handler. Vercel then caches those 404s for
 * a year, so a stale hashed chunk can never recover after a deploy.
 *
 * Insert a no-store 404 after the filesystem handle and before the catch-all,
 * matching nitro#4474.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const configPath = resolve(process.cwd(), ".vercel/output/config.json");
if (!existsSync(configPath)) {
  console.log("[patch-vercel-asset-404] no Vercel output detected, skipping");
  process.exit(0);
}
const config = JSON.parse(readFileSync(configPath, "utf8"));
const routes = Array.isArray(config.routes) ? config.routes : [];

const asset404 = {
  src: "^/assets/(.*)$",
  status: 404,
  headers: { "cache-control": "private, no-store, max-age=0" },
};

const alreadyPatched = routes.some(
  (route) =>
    route.status === 404 &&
    typeof route.src === "string" &&
    route.src.includes("/assets/"),
);

if (alreadyPatched) {
  console.log("[patch-vercel-asset-404] already present, skipping");
  process.exit(0);
}

const filesystemIndex = routes.findIndex((route) => route.handle === "filesystem");
if (filesystemIndex === -1) {
  console.error("[patch-vercel-asset-404] no filesystem handle in", configPath);
  process.exit(1);
}

routes.splice(filesystemIndex + 1, 0, asset404);
config.routes = routes;
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log("[patch-vercel-asset-404] inserted no-store 404 for missing /assets/*");
