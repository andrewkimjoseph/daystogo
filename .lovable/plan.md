# Start calendars on Sunday

Every month grid will run Sunday to Saturday instead of Monday to Sunday.

## What changes
- The Calendar page, the date picker on Create countdown, and the website's calendar all get headers S M T W T F S.
- Each month's first day lands in the right column under the new order; marked days, today, past-day dimming and selection all stay the same.

## Technical details
- In `web_app/src/components/CountdownCalendar.tsx`, `web_app/src/components/BrutalDateTimePicker.tsx` and `website/src/components/MarketingCalendar.tsx`:
  - `WEEKDAYS = ["S","M","T","W","T","F","S"]`
  - grid offset `first.getDay()` instead of `(first.getDay() + 6) % 7`.
- Check in the preview that the current month's day 1 sits under its correct weekday.
