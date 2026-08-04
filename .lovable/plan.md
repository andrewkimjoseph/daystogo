# Editing should also allow editing the name of the goal

## What's changing

The inline "Edit tags" panel on each running countdown card currently only lets you change the colour tag and category. It should also let you rename the countdown. The duration and end time stay locked — only the title joins the editable fields.

## The fix

- Add a title text input to the top of the edit overlay in `src/components/CountdownCard.tsx`, styled in the same brutalist cream panel as the swatches. It's seeded with `countdown.title`, trimmed on save, and committed via the repo's update call.
- Widen `countdownsRepo.updateTags` in `src/lib/countdownsRepo.ts` to accept an optional `title?: string` alongside `colorTag` and `category`, writing it through with `updatedAt` like the other fields. (Keep the method name to avoid touching callers; it already "updates the editable fields".)
- Keep the existing "Time can't be edited" note so users understand time is still locked. Rename its wording only if needed to stay accurate (e.g. "Only the name, colour and category can change — the clock keeps running.").
- No schema or DB change: `title` already exists on every row. No change to `CountdownGrid.tsx`, the repo's other methods, or lapsed cards.

## Technical notes

- `CountdownCard.tsx`: the overlay already sits in an absolutely positioned `div` under the numerals. Insert the title input as the first field. On change, update local state (or call `updateTags({ title })` immediately like the swatches do). Match the existing immediate-save pattern: each change calls `countdownsRepo.updateTags(...)` then `onChanged()`.
- For the title, prefer committing on blur / "Done" rather than every keystroke to avoid a write per character; the swatches/category can keep saving immediately since they're discrete selections.
- `countdownsRepo.updateTags`: change the `patch` type to `{ title?: string; colorTag?: string; category?: CountdownCategory }`. `getDb().countdowns.update(id, { ...patch, updatedAt: Date.now() })` already handles partial patches.
