# Collapse Empty Control Row on Cards

## Goal
Remove the persistent blank space below the progress bar on unhovered countdown cards. The card should stay compact by default and only expand to show the controls (and edit panel) when the user hovers or taps to reveal them.

## Proposed approach
1. Replace the fixed-height `min-h-[48px]` placeholder around the controls with a height-collapsing reveal container.
2. Use the same `grid-rows-[0fr]` → `grid-rows-[1fr]` transition pattern already used for the edit panel, so the control row occupies zero height when `revealed === false` and expands smoothly when `revealed === true`.
3. Keep the existing hover/tap reveal logic, touch-outside dismissal, auto-save on mouse leave, and keyboard focus behavior unchanged.
4. Preserve the progress bar and creation-date footer positions; only the control/edit area should collapse/expand.

## Files to change
- `src/components/CountdownCard.tsx` — remove the `min-h-[48px]` wrapper, convert the controls container to a collapsing grid reveal, and keep transitions consistent with the edit panel.

## Out of scope
- No changes to countdown logic, sorting, data layer, calendar, create form, or share image generation.
- No changes to the hover/tap interaction contract from the previous reveal-card-controls plan.
