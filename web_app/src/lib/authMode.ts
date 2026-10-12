/**
 * Sign-in is optional. When no publishable key is configured — a fresh clone, a
 * bare local preview — the app runs local-only instead of failing to render.
 * Read once at build time, so it never flips while a page is open.
 */
const publishableKey =
  import.meta.env["VITE_PUBLIC_CLERK_PUBLISHABLE_KEY"] ??
  import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"] ??
  "";

export const CLERK_ENABLED = publishableKey.trim().length > 0;
