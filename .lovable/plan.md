# No pausing, editable tags, and a Start button you can actually see

## 1. Countdowns can't be paused — they can be re-tagged

Once a clock starts, its time is fixed. The card's PAUSE button is replaced by an EDIT button that opens a small inline panel on the card with the two things that are safe to change:

- the colour tag (the same five swatches as the create page)
- the category (the same 12 options, as a compact icon grid)

Title, duration, and end time stay locked — they aren't editable, and there's no pause/resume anywhere. Changes save immediately; the panel closes with a DONE button. The delete button stays where it is, and lapsed cards keep their RUN AGAIN button.

Any countdown that was already paused before this change is quietly resumed on load, with its remaining time preserved, so nothing gets stuck in a state the UI no longer offers. The "Paused" badge and its handling are removed from the card.

## 2. Start button moves up next to the page title

On `/create-countdown`, the "START THE CLOCK" button moves into the page header row, right-aligned opposite the "NEW COUNTDOWN" heading, so it's visible without scrolling. The full-width button at the bottom of the form goes away.

On mobile the header stacks: heading, then the button full-width beneath it — still above the fold. The error message (e.g. "Every countdown needs a name") renders directly under the button so it stays next to the control that triggered it.

The "BACK TO THE TIMERS" link stays on its own row above the heading.

## Technical notes

- `src/lib/countdownsRepo.ts`: drop `pause`/`resume`; add `updateTags(id, { colorTag, category })` writing both fields plus `updatedAt`. `reconcile()` gains a pass that converts leftover `status: "paused"` rows to `running` with `endsAt = now + pausedRemainingMs` and clears `pausedRemainingMs`. `remainingMs()` keeps its paused branch as a harmless fallback.
- `src/lib/db.ts`: `CountdownStatus` keeps `"paused"` in the type so existing rows still parse; no schema version bump needed.
- `src/components/CountdownCard.tsx`: pause/resume button → `editing` state toggling an inline edit panel (colour swatches + category grid) that calls `updateTags` then `onChanged()`. Remove the `Pause`/`Play` imports and the paused badge branch.
- `src/components/CreateCountdownForm.tsx`: the `<form>` gets `id="new-countdown-form"`; its bottom submit button and error block are removed. The form exposes nothing else new.
- `src/routes/create-countdown.tsx`: heading row becomes `grid-cols-[minmax(0,1fr)_auto]` on `sm:` with `<button type="submit" form="new-countdown-form">` on the right. Error text is lifted into shared state — simplest path is moving the heading row inside `CreateCountdownForm` so the button and error stay colocated with the form state, with the route passing the heading text; that keeps one source of truth for validation messages.
