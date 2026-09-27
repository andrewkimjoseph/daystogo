# Remove the Clerk development keys

Undo the Clerk key setup and put sign-in back exactly as it was before today's key work.

## Steps
1. Delete the stored `CLERK_SECRET_KEY`.
2. Remove the written-in publishable key (`pk_test_…`) from the app.
3. Restore the original sign-in setup: plain `clerkMiddleware()`, and no `publishableKey` prop on the sign-in provider.
4. Keep the countdown ID feature (card and downloaded image) as it is.

## Heads-up
With no Clerk keys, the preview home page will show the same error screen as before. It needs keys to load here. Your live site isn't affected, as long as its own keys are set there.

## Technical details
- `web_app/src/start.ts`: `requestMiddleware: [errorMiddleware, clerkMiddleware(), csrfMiddleware]`.
- `web_app/src/routes/__root.tsx`: remove the `CLERK_PUBLISHABLE_KEY` constant and the `publishableKey` prop.
- Delete the secret with `secrets--delete_secret`.
