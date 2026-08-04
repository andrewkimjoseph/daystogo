# Fix /calendar reloading over and over in production

## What I verified first

- `https://www.daystogo.xyz/calendar` responds `200`, and the server-rendered HTML already contains the full calendar (header, August grid, day panel).
- The apex domain resolves in one hop: `http://daystogo.xyz/calendar` → `https://www.daystogo.xyz/calendar` (200). There is no redirect ping-pong at the network level any more.
- Loaded the live page in a headless browser (empty local database): no console errors, no page errors, no repeated navigation, page renders and settles.
- `https://daystogo.lovable.app/calendar` returns **404** — the Lovable-published build predates the calendar route.

So the reload loop is not a server redirect. It is client-side, and it only reproduces in a browser that has real state (saved countdowns, a non-UTC timezone) — which is exactly the situation my clean test could not recreate.

## Most likely cause (to confirm as step 1)

`CountdownCalendar` builds its initial state from the *current clock and timezone* during render:

- `const today = new Date()` and the initial `selected` / `view` / `yearPage` values are computed while rendering.
- On the server that clock is UTC; in your browser it is Nairobi time. Whenever the two disagree about the day (or the month, at month edges) the server HTML and the first client render differ, so React throws away the server markup, reports a hydration error, and the root error boundary can kick in. With view transitions enabled, a page that keeps re-mounting reads as "loading over and over".

The same class of bug is what `/about` had before, which is why it looks identical to you.

## Plan

1. **Reproduce with real conditions** — run the live `/calendar` in a browser forced to `Africa/Nairobi` with seeded countdowns in IndexedDB, and capture console/hydration errors and navigation events. If the trace shows a different cause, fix that instead of step 2 and tell you what it actually was.
2. **Make the calendar hydration-safe.** Render the month grid and day panel from a stable, client-owned clock: keep the server pass neutral (no `new Date()` during render), and set today/selected/view once after hydration using the existing `useHydrated` hook. Also treat the `reconcile()` effect and the Dexie live query as client-only so the first client render matches the server HTML exactly.
3. **Harden the fallback** so a single hydration hiccup can never look like an endless reload: the root error boundary should render its message instead of silently retrying.
4. **Verify** — reload the live page in the timezone-forced browser, confirm one navigation, no hydration warnings, and calendar markers still show for existing countdowns. Also re-run the same check on `/about`, `/` and `/create-countdown`, since they share the clock-during-render pattern.
5. **Republish** so `daystogo.lovable.app/calendar` stops 404-ing and the custom domain serves the fixed build.

## Technical notes

- Files touched: `src/components/CountdownCalendar.tsx` (primary), `src/hooks/useHydrated.ts` (only if a stable-now helper is worth extracting), plus the same guard applied where `src/components/CreateCountdownForm.tsx` / card views compute time during render if step 4 flags them.
- No database, schema, or persistence changes. Countdown data, colours and categories are untouched.
- No new dependencies, no routing changes, no canonical/sitemap changes (those already point at `https://www.daystogo.xyz`).
