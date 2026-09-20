# Add weeks to countdown readouts

Countdowns will include whole weeks between months and days, using largest units first: `2mo 1wk 1d 17:07:47`.

## What changes

- Split the remaining whole days into weeks and days after calendar years and months are calculated.
- Show weeks as `wk` and keep the existing unit order: years, months, weeks, days, then time.
- Skip zero-value units, so examples include `1wk 5d 17:07:47`, `2mo 1d 17:07:47`, and `1y 3wk 17:07:47`.
- Keep countdowns under one week unchanged, including the final-minute and lapsed states.
- Apply the same formatting everywhere it appears: countdown cards, calendar rows, the marketing demo, and downloadable PNGs.
- Confirm the longer strings remain on one line at mobile and desktop sizes and inside the downloadable card; adjust the existing shared timer sizing only if needed to prevent clipping.

## Technical details

- Update both countdown formatter copies to derive `weeks = floor(days / 7)` and retain `days = days % 7` after calendar month/year calculation.
- Preserve the current calendar-aware year/month behavior and the formatter’s existing return shape.
- Verify representative durations below one week, above one week, above one month, and above one year, including zero-unit omission.
- No storage, countdown creation, recurrence, or database changes.
