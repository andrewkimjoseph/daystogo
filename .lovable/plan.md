# No Ceiling, Full Ticking

Three changes: drop the 365-day cap, rewrite the hero copy, and make every card tick down to the second no matter how far away the finish line is.

## 1. Remove the max limit

- The duration cap becomes a sanity guard instead of a product limit: allow anything from 3 seconds up to ~100 years (a hard technical bound so dates stay valid).
- The "Days" input in the new-countdown form loses its 365 ceiling.
- The error copy changes from "max is 365 days" to a playful line only for absurd values, e.g. "Forever isn't a thing — pick something this side of the next century."
- The end-time picker keeps working unchanged; it just no longer refuses far-off dates.

## 2. Copy pass

- Hero subtitle: "Three seconds to forever (well — forever isn't a thing, but we'll get close). Everything ticks at once."
- Update the same "3 seconds to 365 days" phrasing in the page metadata (home + about) and in the About page body so nothing still advertises a limit.

## 3. Cards always show minutes and seconds

Today a multi-day countdown collapses to `152d 00h` and looks frozen. New format always includes the live seconds:

```text
under 1 min      00:00:47
under 1 hour     00:12:47
under 1 day      08:12:47
1 day or more    152d 08:12:47
```

Days get a slightly smaller numeral size so the longer string still fits the card on mobile; the last-minute "dramatic" big-and-pulsing treatment stays as is.

## Technical notes

- `src/lib/countdownsRepo.ts`: raise `MAX_DURATION_SECONDS` to a 100-year bound, reword the validation message.
- `src/lib/formatTime.ts`: single format path that always renders `HH:MM:SS`, prefixed with `Nd ` when days remain.
- `src/components/NewCountdownModal.tsx`: remove the `max: 365` on the days unit.
- `src/components/CountdownCard.tsx`: responsive numeral sizing for long strings.
- `src/components/AppShell.tsx`, `src/routes/index.tsx`, `src/routes/about.tsx`: copy updates.
- No schema change; existing countdowns keep working.
