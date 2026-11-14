# Browse the past on the Calendar

## What changes
- **Navigation:** the Calendar's year, month and year-picker arrows no longer stop at the current month. You can go back to any earlier month and select past days.
- **Past events shown:** the calendar marks both active and archived countdowns, including lapsed ones. Past days get their dots just like future days.
- **Archived look:** in the day list, archived countdowns show a small "Archived" label. Lapsed rows still say "Lapsed" and link to their expanded page.
- **No creating in the past:** on a day before today, the "New countdown" button is hidden. Instead you'll see a short note: "This day has passed — you can't start a countdown here." Today and future days keep the button.
- Past days stay slightly faded so they read as the past, but they can be clicked.

## Technical details
- `CountdownCalendar.tsx`: remove the `clamp`/`minY`/`atFloor` floors and `disabled={past}` on days/months/years; keep `past` only for a lighter opacity style.
- Query both `countdownsRepo.all()` and `countdownsRepo.archived()`, merge by id; tag archived via `archivedAt`.
- `DayPanel` gets an `isPast` prop; hide the link and show the note when the day is before today.
- `/create-countdown` already rejects past times in the form, so no change there.
