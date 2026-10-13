# Download button on the expanded countdown page

## What to build

The full-screen countdown page (`/countdowns/$countdownId`) currently has no way
to export the share PNG — downloads live only on the cards' hover controls. Add
a **Download** button outside the card, in the top row next to
"Back to the timers" (top-right of the page, above the card).

- Same brutalist button language as the back link: `brut brut-press`,
  thick border, hard offset shadow, sharp corners, cream background, ink text.
- Icon (`lucide-react` `Download`, strokeWidth 3) plus a short uppercase label
  — "Save PNG" — so it reads at a glance next to the text-only back button.
- Only shows once the countdown has loaded (never with the loader or the
  not-found panel).
- While it works it disables itself; on success shows the same toasts the card
  uses ("Share image downloaded" / "Couldn't make the image. Try again.").
- The exported image is identical to the card download: 1080px share PNG with
  the ID line when signed in.

Nothing else changes: the card stays clean (no in-card button on this page),
the back link keeps its place and behaviour.

## Technical

- `web_app/src/routes/countdowns.$countdownId.tsx`:
  - Import `Download` from `lucide-react`, `toast` from `sonner`, and
    `downloadCountdownImage` from `@/lib/shareImage`.
  - In `CountdownPage`, add a `saving` state and a handler that calls
    `downloadCountdownImage(data, Date.now(), { showId: !!isSignedIn })`
    (identical call to the card's, so the PNG matches what the card exports),
    then toasts success/failure and clears `saving` in a `finally`.
  - Render the button in the existing top row (`<div className="mb-4 flex justify-end …">`),
    before the back link, styled to match it:
    `brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-3 py-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:py-3 sm:text-sm`,
    `disabled={saving || !data}`, `aria-label="Download countdown as PNG"`.
  - `Date.now()` at click time is used instead of the ticking `now` — the share
    image is generated at the moment of download, so the readout is fresh; this
    keeps the button out of BigCountdown's per-second render loop.
- No changes to `shareImage.ts`, `CountdownCard.tsx`, data, or routes.
