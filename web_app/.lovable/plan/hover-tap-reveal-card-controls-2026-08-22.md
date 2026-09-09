# Hover/Tap-Reveal Card Controls

## Goal
Reduce visual crowding on the home-page countdown grid by hiding each card’s action controls until the user hovers over it (desktop) or taps it (touch). The edit panel and delete confirmation follow the same reveal rules.

## Decisions from clarification
- Touch fallback: **tap to reveal** — first tap on a card shows its controls, subsequent taps behave normally.
- Edit panel persistence: **hide on mouse leave** — when the cursor leaves the card, controls and any open edit/delete state collapse.

## Proposed approach
1. Add a local `revealed` state to `CountdownCard`.
2. Desktop hover:
   - `onPointerEnter` (mouse only) sets `revealed = true`.
   - `onPointerLeave` (mouse only) sets `revealed = false`, closes the edit panel, and cancels delete confirmation.
3. Touch tap:
   - `onPointerDown` on the card (touch only, outside the controls area) toggles `revealed`.
   - The controls container stops propagation so tapping a button does not also toggle reveal.
4. Visibility:
   - Wrap the action buttons and edit panel in a reveal container.
   - When `revealed` is false: `opacity-0 pointer-events-none` with a short translate/opacity transition.
   - When `revealed` is true: fully visible and interactive.
   - Reserve the controls’ row height in both states so the grid does not reflow when a card is hovered.
5. Edit/delete behavior:
   - Edit panel only renders when `revealed && editing && !lapsed`.
   - On mouse leave, commit any title change and clear `editing`/`confirmingDelete`.
   - Delete confirmation row only renders when `revealed && confirmingDelete`.
6. Accessibility:
   - Keep controls focusable: `focus-within` / focus events force `revealed = true` so keyboard users can still reach the buttons.
   - Add `aria-hidden={!revealed}` to the hidden controls container.

## Files to change
- `src/components/CountdownCard.tsx` — add reveal state, pointer handlers, and conditional visibility for controls/edit panel/delete confirmation.
- `src/styles.css` (optional) — add a small `.card-reveal` utility if the arbitrary Tailwind variants become unwieldy.

## Out of scope
- No changes to countdown logic, sorting, data layer, or other routes.
- The share-image generation and card content (title, time, progress bar, footer) stay unchanged.
