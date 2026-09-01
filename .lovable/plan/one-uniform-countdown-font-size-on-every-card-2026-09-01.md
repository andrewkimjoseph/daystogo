# One uniform countdown font size on every card

Right now the countdown readout changes size depending on how long the text is (and grows in the final minute), so cards in the same grid look inconsistent and long strings like `1y 5mo 25d 22:25:33` still clip or crowd the card.

## What changes

- Every countdown card renders its timer at exactly one font size, no matter the remaining time or string length.
- The size is chosen so the longest possible readout (`1y 11mo 30d 23:59:59`) fits on a single line at mobile width, with no clipping and no wrapping.
- The final-minute / lapsed readout uses that same size (no more jump to a bigger type) — urgency stays conveyed by the red colour and pulse, and lapsed cards keep their gradient panel and cream text.
- The calendar day-panel rows and the downloadable PNG keep working unchanged; only the card typography is normalised.

## Technical notes

- In `src/components/CountdownCard.tsx`, replace the conditional class chain on the timer `<p>` (the `dramatic` / `length > 20` / `length > 16` tiers) with a single fixed pair of classes, keeping `tick-numerals whitespace-nowrap` and the existing colour/pulse logic.
- Target size: `text-xl sm:text-2xl` — verified against the longest string at the narrowest card width so nothing clips; the `length` value returned by `formatRemaining` is no longer needed in the card and its destructuring is cleaned up.
- No changes to `src/lib/formatTime.ts`, `src/lib/shareImage.ts`, or the DB.
- Verification: render cards with short (`00:00:30`), medium (`1mo 26d 00:55:22`) and longest (`1y 11mo 30d 23:59:59`) readouts at mobile and desktop widths and confirm identical size with no overflow.
