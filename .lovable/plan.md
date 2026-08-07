# Target-time only countdowns

Simplify to a single way of counting: pick an exact end date and time. Drop short durations and the "Run again" restart.

## Changes

1. Creation form (`src/components/CreateCountdownForm.tsx`)
   - Remove the Duration / End time mode toggle; the form always uses end time.
   - Remove the duration-type buttons (Secs / Mins / Hours), the number input, and the "Lands on ..." duration preview.
   - Keep title, colour tag, category, calendar + typable time, and the live "in X to go" preview.
   - The right column always shows the date/time picker, so the layout stays balanced.

2. Countdown card (`src/components/CountdownCard.tsx`)
   - Remove the "Run again" button. A lapsed card shows the LAPSED badge, 00:00:00, and only the delete action (edit stays available for non-lapsed cards as today).

3. Cleanup
   - Remove the now-unused `restart` helper from `src/lib/countdownsRepo.ts` and the `RotateCcw` import.
   - Keep existing data intact: rows already stored as duration-mode still display and lapse normally; only creating new duration countdowns goes away.

## Technical notes

- `countdownsRepo.create` keeps both input shapes for type compatibility, but the form only calls the `mode: "target"` branch. Minimum span validation (3s) still applies.
- Calendar deep-link (`/create-countdown?date=...`) keeps working since target mode is now the only mode.
