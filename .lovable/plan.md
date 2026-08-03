# Prefill the new-countdown form from a calendar date

Tapping "New countdown" on a selected day in /calendar should open the creation
page already set to "End time" mode, with that date filled in.

## What changes

1. **Calendar passes the date along.** The "New countdown" button in the day
   panel links to `/create-countdown?date=YYYY-MM-DD` for the selected day. The
   button also appears on days that already have countdowns (currently it only
   shows on empty days), so any explored day can seed a new clock.

2. **The form reads it.** `/create-countdown` accepts an optional `date` search
   param. When present and valid:
   - mode starts on **End time** instead of Duration
   - the date/time picker starts on that day at a sensible local time
     (09:00 if the day is in the future, otherwise one hour from now so the
     target is never already past)
   - if the date is in the past, it is ignored and the form opens as normal
   No prefill, no behaviour change: the page looks exactly as it does today.

3. **Quiet fix along the way.** The day-panel heading currently formats the date
   during server render and again in the browser, which throws a hydration
   mismatch on /calendar. The heading will render after hydration so the
   viewer's own locale is always used.

## Technical notes

- `src/routes/create-countdown.tsx`: add `validateSearch` with
  `zodValidator` + `fallback(z.string(), "")` for `date`, pass the value into
  `<CreateCountdownForm initialDate={...} />`.
- `src/components/CreateCountdownForm.tsx`: accept `initialDate`, parse it as a
  local date, and use it in the existing `useEffect` that seeds `targetInput`
  via `localInputValue`; set `mode` to `"target"` when the date parses to a
  future moment.
- `src/components/CountdownCalendar.tsx`: build the search param from the
  selected `Date` using local Y/M/D (not `toISOString`, which shifts timezone),
  render the "New countdown" link in both empty and populated panel states, and
  gate the heading string behind `useHydrated`.
