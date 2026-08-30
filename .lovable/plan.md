# Hourglass badges + emoji auth buttons on mobile

## What changes

1. **Status badges become emoji-only**
   - Running countdowns: badge shows just ⏳ (hourglass with flowing sand) — no "RUNNING" text.
   - Lapsed countdowns: badge shows just ⌛ (completed hourglass) — replaces the current "🎉 Lapsed!".
   - Applies to the web card badge and the downloadable PNG badge.
   - The coloured chip behind the badge stays (tag colour when running, red when lapsed).
   - Accessibility: the badge keeps `title` / `aria-label` ("Running" / "Lapsed") so screen readers and hover still explain it.

2. **Sign in / Sign up become emoji buttons on mobile**
   - Same responsive pattern the header already uses for Calendar/About/Archive: emoji-only on small screens, full text on `sm:` and up.
   - Sign in → 🔑, Sign up → ✨ (with `title`/`aria-label` so they stay understandable; easy to swap emojis if you prefer others).

## Files

- `src/components/CountdownCard.tsx`
  - Badge at line ~151: `const badge = lapsed ? "🎉 Lapsed!" : "Running"` → render the emoji only, with `title`/`aria-label`.
- `src/lib/shareImage.ts`
  - Badge block (lines ~174–192): draw only the emoji (existing emoji font stack already handles canvas rendering), drop the text/`badgeW` text measurement, keep the coloured chip and its border/shadow.
- `src/components/AuthControls.tsx`
  - Wrap each button's label: `<span className="sm:hidden">🔑</span><span className="hidden sm:inline">Sign in</span>` (same for ✨ / Sign up).

## Notes

- No data, routing, or build changes — pure presentation.
- The "Lapsed" text label in the calendar day panel stays as-is (different context, not a badge).
