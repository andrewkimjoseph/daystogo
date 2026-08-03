# Countdown to a specific date and time

Add a second way to create a countdown: instead of "7 days", pick an exact end moment in your own local time ("3 Aug 2026, 18:30") and the clock runs until then.

## What it looks like

In the New countdown modal, a two-button mode switch at the top:

```text
[ DURATION ]  [ END TIME ]
```

- DURATION: the existing Secs/Mins/Hours/Days + amount flow, unchanged.
- END TIME: a single native date-and-time picker, pre-filled with a sensible default (one hour from now, rounded), plus a live helper line under it reading e.g. "That's 4 hours, 12 minutes from now."

Validation matches the existing rules, phrased for a target time:
- must be in the future by at least 3 seconds
- must be within 365 days from now
- errors use the same red brutalist error block

The countdown starts the moment you hit create, exactly like today, and lapses at the chosen instant.

## Behaviour details

- The card display is unchanged — it still ticks down the remaining time.
- Cards created from an end time show the target under the title, formatted in local time (e.g. "Ends Mon 3 Aug, 18:30").
- Pause/resume works the same way: pausing freezes the remaining time, resuming pushes the end out. This means a paused target countdown will no longer land on the original clock time — that's the expected trade-off for pausing.
- "Run again" re-runs the same total length from now (the original target is in the past by then).

## Technical notes

- `Countdown` gains two optional fields: `mode: "duration" | "target"` (absent/undefined treated as `"duration"` for existing rows) and `targetAt?: number` (epoch ms). Bump the Dexie version to 2 with the same store definition plus `targetAt` in the index list; no data migration needed since both fields are optional.
- `countdownsRepo.create` accepts either shape: existing duration input, or `{ mode: "target", targetAt }` where `durationSeconds` is derived as `Math.round((targetAt - now) / 1000)` so all downstream logic (progress bar, restart, remaining time) keeps working untouched.
- Validation helper in `countdownsRepo` reuses `MIN_DURATION_SECONDS` / `MAX_DURATION_SECONDS`.
- The picker uses `<input type="datetime-local">`, which is already local-time by nature; convert with `new Date(value).getTime()` and format back with a small local-time helper for the default value. No timezone library.
- `NewCountdownModal` holds a `mode` state and conditionally renders either the duration fields or the target field; the colour tag, title, and submit button are shared.
- `CountdownCard` renders the "Ends …" line only when `targetAt` is set and status is not lapsed, using `toLocaleString` with weekday/day/month/time parts.
