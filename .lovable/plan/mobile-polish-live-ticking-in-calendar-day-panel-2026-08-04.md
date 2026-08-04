# Mobile polish + live ticking in calendar day panel

## 1. The "seconds aren't moving" bug

In the calendar's day panel, each countdown row currently shows the *landing moment*
(`Sun 13 Sept, 13:44:59 · Running`). That is a fixed target timestamp, so by design nothing
in it ever changes — which reads as a frozen clock.

Fix: give those rows a live line driven by the same one-second tick the home grid uses.

- Row becomes: title, then `13:44:59 · Running` for the landing moment, plus a live
  `2d 03:14:59 to go` value that decrements every second (for lapsed items: `Lapsed`).
- Use the existing shared tick hook (`useCountdownTick`) and `remainingMs` /
  `formatRemaining` helpers so the calendar and cards agree to the second.
- The tick is mounted inside the already client-only calendar body, so hydration stays safe
  (this is what caused the earlier `/calendar` reload loop — keep it client-only).

## 2. Mobile responsiveness pass

Checked all four routes at 390px wide: no horizontal overflow, so this is refinement, not
rescue. Targeted fixes:

- **Header**: the "New" button is hidden below `sm`, so on a phone the primary action
  disappears from the header. Show a compact icon/short-label version at all widths and tighten
  the button row spacing so logo + 3 controls fit comfortably on small phones.
- **Countdown cards**: reduce padding and digit size a step at the smallest width, make the
  action row (Edit / Reset / Delete) full-width and thumb-sized, and make the edit overlay
  fill the card on mobile instead of overflowing it. Colour/category swatch grids get larger
  tap targets (min 44px).
- **Create form**: give the category grid comfortable tap heights, keep the sticky-ish
  "Start the clock" button reachable, and stack the duration/end-time panes with tighter
  vertical rhythm so less scrolling is needed.
- **Calendar**: shrink day cells and marker dots slightly on narrow screens so the 7-column
  grid keeps square-ish cells, and let day-panel rows wrap their meta line instead of
  truncating hard.
- **About / page chrome**: normalise the "Back to the timers" button and heading sizes on
  mobile, and audit every text+widget row for the `grid-cols-[minmax(0,1fr)_auto]` +
  `min-w-0` + `shrink-0` pattern.

## Technical notes

- Files touched: `src/components/CountdownCalendar.tsx` (live tick in `DayPanel`,
  responsive cells), `src/components/SiteHeader.tsx`, `src/components/CountdownCard.tsx`,
  `src/components/CreateCountdownForm.tsx`, `src/routes/calendar.tsx`, `src/routes/about.tsx`,
  `src/routes/create-countdown.tsx`.
- No database, schema, or countdown-logic changes; presentation and a display-only ticker.
- Verification: Playwright screenshots at 390px and 768px for all four routes, plus a
  two-second sampling of the day-panel row to confirm the seconds value changes.
