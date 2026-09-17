# Slim down the Repeat picker

The Repeat picker on /create-countdown is too bulky and its 2-column grid leaves an empty slot next to Yearly. Make it compact and balanced while keeping the brutalist look.

## What changes

In `web_app/src/components/CreateCountdownForm.tsx`, the REPEAT section:

- **Smaller buttons**: reduce padding and label size (e.g. `px-3 py-2`, `text-xs` uppercase labels) so each option is a compact button, roughly half its current height.
- **Balanced grid**: replace the 2-column grid with a layout that fills evenly with 5 options — a 6-column grid where each button spans 2 columns on the first row (Does not repeat, Daily, Weekly) and 3 columns on the second (Monthly, Yearly); collapses to 2 per row on mobile with the last button full-width. No empty slots.
- **Selection state stays**: teal fill + cream text for the selected option, thick black border and the shared brutalist hard shadow tokens everywhere (no new ad-hoc shadows).
- **Keep everything else**: same five options from `RECURRENCE_OPTIONS`, same default ("Does not repeat"), same hint tooltip behavior if present, no functionality changes.

## Technical details

- Single-file edit in `CreateCountdownForm.tsx` (repeat picker markup only).
- Use existing shadow/border utility tokens from `src/styles.css`; no new colors.
- Verify with a Playwright screenshot of /create-countdown on desktop and mobile widths; run `bunx tsgo --noEmit` in web_app.
