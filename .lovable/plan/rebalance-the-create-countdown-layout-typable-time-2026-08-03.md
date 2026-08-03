# Rebalance the create-countdown layout + typable time

Right now the calendar and the time steppers are stacked inside the right card, so the left card ends halfway down the page and leaves a big empty block of cream. The time is also stepper-only — you can't type it.

## What changes

**1. Split the picker across both columns (End time mode only)**

- Right card: the year row, month row, and the day grid (plus the month/year pane grids).
- Left card: below Colour tag, a new "Time" block holding the hour/minute controls and the "That's 57 minutes from now." summary line.
- Result: both columns end at roughly the same height, no dead space. Duration mode is untouched.

**2. Type the time**

- Hour and minute become real text inputs styled like the existing numerals (big, bold, cream field, square corners), each with the up/down chevrons kept above/below.
- While typing, partial input is allowed (empty, "1", "07"). On blur or Enter the value is parsed, clamped (hour 0–23, minute 0–59), zero-padded, and committed to the selected date. Invalid text reverts to the last good value.
- Steppers keep working exactly as now (1 hour / 1 minute).
- Colon stays centred between the two fields on the numeral row.

**3. Mobile**

Single column stays as-is: basics, then time block, then calendar — full-width, tap targets unchanged (h-11).

## Technical notes

- `BrutalDateTimePicker` splits into two exported pieces sharing the same `value`/`onChange` contract: a calendar part and a time part (one file, two components, no state duplication — both derive from the `value` string, as today).
- `CreateCountdownForm` renders the time part in the left card and the calendar part in the right card when `mode === "target"`.
- Local draft state for the two text inputs (so typing isn't fought by re-parsing on each keystroke), synced from `value` when it changes externally.
- The 560px hydration placeholder shrinks to match the calendar-only height.
