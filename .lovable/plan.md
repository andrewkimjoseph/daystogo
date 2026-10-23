# Days-remaining toggle on the expanded countdown

Add a toggle on the expanded countdown page that switches the big timer between the current breakdown (`2mo 2wk 1d 13:29:00`) and a plain days count (`75 days 13:29:00`). Save PNG exports whichever format is showing.

## Behaviour
- A brutalist toggle button sits in the top row next to Save PNG, labelled "Days" / "Full" with an icon. It shows which format is on.
- Days mode: total whole days plus the clock, e.g. `75 days 13:29:00`. `1 day` when singular. Under a day it shows only the clock, the same as today. The final-minute and lapsed `00:00:00` behaviour stays as it is.
- The timer still auto-fits the card width.
- Save PNG uses the format currently selected.
- The choice is remembered on this device, so it stays set the next time you open a countdown.
- Regular cards and their downloads don't change.

## Technical notes
- `formatTime.ts` (both the `web_app` and `website` copies): add an optional `mode: "full" | "days"` to `formatRemaining`. The default stays `"full"`, so existing callers are unaffected.
- `shareImage.ts`: add `format?: "full" | "days"` to `opts` and pass it through to `formatRemaining`.
- `countdowns.$countdownId.tsx`: add a toggle state stored in localStorage (read it after the page hydrates), pass it to `BigCountdown` and to `downloadCountdownImage`.
- Add a unit test for days mode: 75 days 13:29:00 → `75 days 13:29:00`, 1 day → `1 day …`, and under a day → clock only.
