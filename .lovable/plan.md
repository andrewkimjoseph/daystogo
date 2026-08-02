# Plan: Add an /about page

## Goal
Add an About page (`/about`) that describes the Days To Go project and links to the user's GitHub (https://github.com/andrewkimjoseph), styled in the existing playful-brutalist design system.

## Current state (verified)
- Routing is file-based under `src/routes/`. Home is `src/routes/index.tsx` using `<AppShell>`.
- `AppShell.tsx` owns the header: logo (image) + `<MuteToggle />`, a hero ("Put a clock on it."), the countdown grid, and the floating "New countdown" button. There is no shared header/nav component and no link to /about yet.
- Design tokens & brutalist utilities live in `src/styles.css` (`brut`, `brut-press`, `hero-gradient`, palette tokens: cream/teal/mauve/red/slate/ink). Fonts (Archivo Black / Space Grotesk) load via `__root.tsx`.
- `src/lib/palette.ts` exports `PALETTE`.

## Changes

### 1. New route: `src/routes/about.tsx`
- `createFileRoute("/about")` with its own `head()`: title `Days To Go — About`, description, og:title/og:description (distinct from home), `og:type: website`.
- Component renders:
  - A brutalist header bar matching the home page: logo image linking back to `/` (via `<Link to="/">`), plus `<MuteToggle />`, plus a small "Home" link.
  - A hero: "About Days To Go" with `hero-gradient`.
  - Body copy describing the project: playful brutalist countdown timers, 3 seconds to 365 days, everything ticks at once, runs locally in your browser (no account, no server), confetti + chime on lapse, pause/resume/restart, mute toggle.
  - A prominent GitHub link button: brutalist `brut brut-press` button linking to `https://github.com/andrewkimjoseph` (external `<a target="_blank" rel="noreferrer">`), with the GitHub mark (lucide `Github` icon) and text "andrewkimjoseph on GitHub".
  - A "Back to the timers" `<Link to="/">` button.
- Keep the page on the cream dotted background (inherits from `body`); wrap content in `max-w-3xl`.

### 2. Add About link to the home header
- In `src/components/AppShell.tsx`, add a small nav area in the header next to `<MuteToggle />`: a `<Link to="/about">` styled as a brutalist pill button ("About"), so the page is reachable from home. Keep logo and mute toggle unchanged.

### 3. Logo import on about page
- Reuse the same logo asset import pattern: `import logoAsset from "@/assets/logo.svg.asset.json"` (already used in AppShell) and `logoAsset.url`.

## Notes
- No business logic / DB changes — pure presentation + a new route file + one header tweak.
- MuteToggle works app-wide via session state; reusing it on /about is fine.
- No new dependencies (lucide-react `Github` icon already available).

## Verification
- Build/typecheck passes (route file matches generated route id `/about`).
- Playwright: navigate to `/about`, confirm hero text, GitHub link href, and the back-home link resolve and render in brutalist style.
