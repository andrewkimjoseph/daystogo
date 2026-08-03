# Year navigation in the date picker

Right now the picker only has previous/next month arrows, so getting to a date next year takes twelve clicks and there is no way to jump to a distant year at all.

## What changes

- The header becomes two parts: a year row and a month row.
  - Year row: `‹ 2026 ›` steppers, plus a clickable year label that opens a year grid.
  - Month row: keep the `‹ AUGUST ›` arrows, and let the month name itself open a 12-month grid for one-click month jumps.
- Year grid: a 4x3 grid of 12 years centred on the current view year, with `‹ ›` arrows to page by 12 years. Picking a year returns to the day grid on the same month.
- Month grid: 3x4 grid of month abbreviations; picking one returns to the day grid.
- Selecting a year or month only moves the view; the chosen day/time stays as-is (clamped when the day does not exist in the new month, e.g. 31 Jan to Feb).
- Add a "+1 year" quick preset alongside the existing presets.
- Styling stays brutalist: sharp corners, `brut-thin` borders, teal/cream selection, `tick-numerals` for numbers — same as the day grid.

## Technical notes

- All in `src/components/BrutalDateTimePicker.tsx`; no data-layer or repo changes.
- Add local state `pane: "days" | "months" | "years"` and a `yearPageStart` derived from `view.y`.
- Reuse the existing `commit`/`localInputValue` path, so `NewCountdownModal`'s relative-time preview keeps updating.
- Verify with a Playwright run: open the modal in End-time mode, jump forward a year, confirm the preview blurb reads roughly a year from now.
