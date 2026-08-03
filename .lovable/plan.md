# Editing one card shouldn't stretch its neighbours

## What's happening

Cards sit in a grid row and are told to fill the full row height so every "Edit tags" button lines up across the grid. When you open the tag editor on one card, that card gets taller, the whole row grows, and the neighbouring card stretches to match — leaving it with a tall blank gap above its progress bar.

## The fix

Keep the aligned footers, but stop the tag editor from changing the row height:

- Render the tag panel as an overlay layered inside the card it belongs to, anchored just under the countdown numerals, instead of as a block that pushes content down.
- The panel keeps its brutalist border, cream background and pop-in animation, and sits above the card's own content while open.
- The card's height, progress bar and footer buttons stay exactly where they were, so neighbouring cards never move.
- Clicking "Done" (or the card's edit toggle) closes the overlay as it does today.

## Technical notes

- `src/components/CountdownCard.tsx`: move the `editing && !lapsed` panel out of the normal flex flow into an absolutely positioned wrapper inside the existing `relative` article (top offset below the numerals, left/right inset to the card padding, `z-10`). Keeps `h-full` on the card and `mt-auto` on the footer untouched.
- No change to `CountdownGrid.tsx`, the repo layer, or the hover tooltips added for tag names.
