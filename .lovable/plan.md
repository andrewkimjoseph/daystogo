# Add a "Yearly" repeat option

Add a fourth recurrence choice — Yearly — alongside None / Daily / Weekly / Monthly. A yearly countdown re-lands on the same date and time every year (e.g. a birthday), then keeps ticking like the other repeating options.

## What changes

1. **`web_app/src/lib/db.ts`** — add `"yearly"` to the `Recurrence` type union.

2. **`web_app/src/lib/recurrence.ts`** —
   - Add a Yearly entry to `RECURRENCE_OPTIONS` with label "Yearly" and hint "Same date and time, every year. Feb 29 lands on Feb 28 in non-leap years."
   - Include `"yearly"` in `isRecurring`, `recurrenceLabel`, and `step` (via `addYears` from date-fns) so advancing/next-occurrence logic works.

3. **`web_app/src/lib/countdownsRepo.ts`** — allow `"yearly"` in the create-time normalization so it isn't dropped when saving.

No other changes needed: the create form, card badge (repeat icon + "YEARLY"), downloadable PNG, and calendar all read from `RECURRENCE_OPTIONS` / the shared helpers automatically. The database column stores recurrence as plain text, so no migration is required; older rows without a recurrence keep behaving as non-repeating.

## Verification

- TypeScript check passes.
- Playwright against the preview: create a yearly countdown, confirm the repeat picker shows YEARLY, the card shows the rotating-arrows icon + "YEARLY" on the date line, and the countdown advances past its landing instead of staying lapsed.
