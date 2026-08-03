# Fix end-time label and minute stepper

## 1. Show the year when the countdown doesn't end this year

The card label currently reads `ENDS FRI 6 AUG, 07:53` with no year, so a countdown ending in 2032 looks like it ends this week.

- Update `formatTargetLabel` in `src/lib/localTime.ts` to compare the target's year with the current year.
- Same year: keep today's format (`Fri 6 Aug, 07:53`).
- Different year: append the year (`Fri 6 Aug 2032, 07:53`).

## 2. Minutes should step by 1, not 5

The Min stepper in `src/components/BrutalDateTimePicker.tsx` is wired with a step of 5, which is why tapping the arrow jumps 5 minutes. Change it to 1 so hour and minute both nudge one unit per tap.

## Notes

Both are small presentational changes; no data model or persistence changes. Existing countdowns pick up the new label automatically.
