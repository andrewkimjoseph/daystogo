# Card header + calendar past days

## 1. "RUNNING" badge on its own line
In `src/components/CountdownCard.tsx`, move the status badge out of the side-by-side header row so the title never wraps around it: the badge sits on its own line above the category/title block, aligned left (or right), and the title gets the full card width.

## 2. Grey out past days in the picker
In `src/components/BrutalDateTimePicker.tsx` days pane, treat any day before today as past: render it dimmed (same muted treatment as out-of-month days) and non-selectable (disabled, no click). Today and future days stay fully legible and clickable. Month/year panes keep current behaviour.

## Notes
Presentation-only changes; no data or countdown logic is touched.
