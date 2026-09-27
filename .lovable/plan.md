# Use Clerk development keys in the preview

Swap out the temporary "skip sign-in when keys are missing" fix for your real development keys, so sign-in works in the preview. Then you can check that the countdown ID shows up.

## Steps
1. Open a secure form that asks for two keys. Their values never go through the chat:
   - `VITE_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)
   You'll find both in the Clerk dashboard under your development instance, then API keys.
2. Remove the temporary fix, so the app always runs sign-in again.
3. Pass the publishable key to the sign-in provider by that exact name. It falls back to Clerk's usual names (`VITE_CLERK_PUBLISHABLE_KEY` / `CLERK_PUBLISHABLE_KEY`), so production keeps working.
4. Restart the preview and confirm the home page loads with no error. Then sign in and check that "ID / …" appears on a card and in a downloaded image.

## Technical details
- `web_app/src/start.ts`: set `requestMiddleware` back to `[errorMiddleware, clerkMiddleware(), csrfMiddleware]`.
- `web_app/src/routes/__root.tsx`: set `publishableKey={import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY ?? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}` on `ClerkProvider`. If the client bundle can't see the stored secret, also have Clerk's server middleware read it (`clerkMiddleware({ publishableKey: process.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY })`).
