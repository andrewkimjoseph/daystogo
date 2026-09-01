# Add years and months to the countdown readout

Long countdowns currently read `87d 01:02:33`. They will read `1y 2mo 5d 01:02:33`, so the wait is easier to grasp at a glance — with the text auto-shrinking so it always stays on one line, both on the card and in the downloadable PNG.

## How the new format behaves

- Under a month: unchanged (`27d 01:02:33`, `01:02:33` in the last day, `00:00:00` at zero).
- One month or more: `2mo 5d 01:02:33`.
- One year or more: `1y 2mo 5d 01:02:33`.
- Zero-value units are skipped (`1y 5d 01:02:33` when there is no whole month left).
- Months and years are counted on the real calendar (from now to the end moment), so "1 month" means the same day next month, not a fixed 30 days.
- The final-minute dramatic styling and the lapsed `00:00:00` behaviour stay exactly as they are.

## Fitting on one line

- Card: the countdown line shrinks by step when the text gets longer (years/months present), so it never wraps — the shortest countdowns keep today's large type.
- Downloadable PNG: the existing auto-fit already shrinks to one line; its minimum size is lowered so the longer string fits at 1080px wide without clipping.
- The calendar page's "… to go" text uses the same formatter, so it picks up years/months automatically.

## Technical notes

- `src/lib/formatTime.ts`: `formatRemaining(ms)` gains an optional `now`/`endsAt` pair (or accepts the target timestamp) so it can compute calendar years/months, falling back to the current day-based output when only a duration is available. Returns the same `{ text, dramatic }` shape plus a length hint used for sizing.
- `src/components/CountdownCard.tsx`: pass the countdown's end timestamp into `formatRemaining`; pick the timer font size from the returned length hint (responsive Tailwind classes, no hardcoded colours).
- `src/lib/shareImage.ts`: pass the same arguments; lower `clockMin` so `fitLines` keeps one line.
- `src/components/CountdownCalendar.tsx`: pass the end timestamp through where it calls the formatter.
- No data model, storage, or business-logic changes.
