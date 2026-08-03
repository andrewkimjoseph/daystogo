# Show seconds in long-form date and span text

Right now the "That's ... from now" blurb caps out at two units and never mentions seconds, and long-form dates ("Lands on Mon, 3 Aug 2026, 23:27") stop at minutes. Add seconds everywhere.

## Changes

1. Span blurb (`src/lib/localTime.ts`, `spanFromNow`)
   - Keep days / hours / minutes, and always append a seconds part.
   - Drop the two-part truncation so the full breakdown reads: "That's 1 day, 59 minutes, 0 seconds from now."
   - Zero-value units in the middle stay omitted, but seconds are always shown (including "0 seconds").
   - Past target message stays unchanged.

2. Long-form date labels
   - `formatTargetLabel` (used by the cards and the calendar day panel) gains `second: "2-digit"`, so it reads "Mon 3 Aug, 23:27:04".
   - The "Lands on ..." preview in `src/components/CreateCountdownForm.tsx` also gains `second: "2-digit"`.

3. Live ticking
   - The create form's previews recompute on the existing render cadence; if they only update on input change, add a 1s tick in the form so the seconds value stays truthful while the page sits open.

No data model, styling, or route changes.
