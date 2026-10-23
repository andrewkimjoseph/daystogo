# Days toggle for the whole board

Add a Days / Full toggle to the filter row on the board (and Archived page) that switches every card's timer between the full breakdown (`1mo 1wk 1d 10:55:17`) and a plain day count (`37 days 10:55:17`).

## Behaviour
- A brutalist toggle button sits at the right end of the category filter row, matching the filter buttons' height. Icon + "Days"/"Full" on desktop; icon only on mobile (with an accessible label) so it never crowds the filters. It stays pinned to the right while filters wrap or scroll.
- Switching changes every card at once; card downloads use the same format.
- It shares the same remembered setting as the toggle on the expanded countdown page, so flipping one flips the other.
- Under a day, the last minute, and lapsed cards look exactly as now.

## Technical notes
- New `web_app/src/hooks/useTimerFormat.ts`: reads/writes `dtg-timer-format` in localStorage after hydration, syncs across components via a custom event + `storage` event.
- `CountdownGrid.tsx`: render the toggle in the filter row (flex with filters `flex-1`, toggle `shrink-0`), also when no category filters exist.
- `CountdownCard.tsx`: use the hook; pass `format` to `formatRemaining` and `downloadCountdownImage`.
- `countdowns.$countdownId.tsx`: replace its local state with the hook.
- Verify with Playwright at 1280 and 390px: toggle flips all cards, persists on reload.
