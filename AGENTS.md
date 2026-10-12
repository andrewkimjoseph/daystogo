# Days To Go — Project Rules

## Structure

- The app lives in `web_app/` (TanStack Start + Vite). Files at the repo root
  (`package.json`, `lovable.toml`, `tsconfig.json`) only wire the sandbox to
  that folder: install, dev, typecheck and the build copy of `web_app/dist`
  into `/dev-server/dist`. Keep them working; don't move the app to the root.
- `web_app/src/lib/formatTime.ts` has a second copy under `website/` that must
  be edited in the same change, so both sites format durations identically.

## Sign-in

- Sign-in is optional, never fatal. Clerk's middleware (`web_app/src/start.ts`)
  and `ClerkProvider` (`web_app/src/routes/__root.tsx`) are mounted only when
  the matching keys are configured — `CLERK_SECRET_KEY` on the server, a
  `VITE_*_CLERK_PUBLISHABLE_KEY` on the client (`web_app/src/lib/authMode.ts`).
  Without them the app runs local-only instead of returning a 500 error page.
  A deployment that sets the keys keeps the previous behaviour untouched.
- Components never call Clerk's `useAuth` directly; they use
  `web_app/src/lib/useAuthState.ts`, which reports "signed out" when sign-in
  isn't configured. Add new auth checks through that hook so a keyless preview
  can't crash a page.
- Sign-in and sign-up routes render a plain "isn't set up" panel when keys are
  missing, rather than Clerk's widgets.
