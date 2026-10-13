# Limit guests to one countdown

Logged-out visitors can create exactly one countdown (active or archived). When they try to create a second one, they get a playful signup nudge instead. Signed-in users are unaffected.

## What changes

1. **Guest limit check on submit** — in `CreateCountdownForm.tsx`, before creating:
   - If signed out (via `useAuthState`) and the local store already holds one or more countdowns (active + archived, via `countdownsLocal.all()` + `countdownsLocal.archived()`), don't create. Show the signup nudge instead.
   - Signed-in users skip the check entirely (cloud sync, unlimited).

2. **Signup nudge panel** — a brutalist panel replacing the form area when the limit is hit:
   - Headline in the app's voice, e.g. "One clock per stranger."
   - Copy explaining that a free account unlocks unlimited countdowns, synced across devices.
   - A "Sign up" button (uses the existing `SignUpButton` when Clerk is configured; hidden/disabled state otherwise per the app's keyless rules) and a "Back to the board" link.
   - Dismissible so the guest can return to their single countdown.

3. **Edge cases**
   - Deleting the one countdown frees the slot (count is live from Dexie, not a flag).
   - Archiving does NOT free the slot (per your choice: active + archived both count).
   - No server-side change needed: guests never reach the cloud path.

## Technical notes

- Check lives in `CreateCountdownForm.submit()` — form stays fully usable for the first countdown.
- Reuses existing `useAuthState`, `countdownsLocal`, and `AuthControls`-style buttons; no new dependencies.
- No changes to cloud sync, schema, or signed-in flows.

## Verification

- Signed out: create one countdown (works), try a second (nudge appears), delete it, create again (works), archive it and try again (nudge appears).
- Signed in: create multiple countdowns with no nudge.
- Typecheck + build pass.
