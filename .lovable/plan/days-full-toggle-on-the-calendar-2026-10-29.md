# Days / Full toggle on the Calendar

Add the same Days / Full toggle to the Calendar page's day panel so its countdown rows (e.g. `4wk 1d 20:12:25 to go`) can switch to a plain day count (`29 days 20:12:25 to go`).

## Behaviour
- The toggle sits in the day panel header, to the right of the date heading, matching the board's toggle: icon + "Days"/"Full" on desktop, icon only on mobile with an accessible label.
- Every row in the day panel follows the setting.
- It's the same remembered setting as the board and expanded countdown, so flipping it anywhere flips it everywhere.

## Technical notes
- `CountdownCalendar.tsx`: `DayPanel` uses `useTimerFormat()` and renders the toggle (same markup/classes as in `CountdownGrid.tsx`) in a flex header row; `DayPanelRow` passes `format` to `formatRemaining`.
- Verify with Playwright at 1280 and 390px: toggle flips the rows and persists after reload.
