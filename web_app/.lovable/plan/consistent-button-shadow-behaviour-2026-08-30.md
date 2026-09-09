# Consistent button shadow behaviour

Right now buttons across the app use two different interaction utilities. `brut-press`
(header links, FAB, form buttons, calendar controls) and `brut-pop` (the card control
buttons: edit, delete, archive, download, confirm/cancel) behave differently on press:
one flattens completely, the other keeps a small shadow. Card badges (the ⏳/⌛ chip)
and other static chips carry a shadow but never respond, so hovering a card makes the
mix look uneven.

## Goal

One shared interaction behaviour for every clickable element: same shadow sizes, same
lift on hover, same inward flatten on press, same timing.

## What changes

1. Collapse `brut-pop` into `brut-press` behaviour — a single interaction utility with:
   - rest: the element's base shadow (3px for `brut`, 2px for `brut-thin`)
   - hover: lift out, 4px shadow
   - active: move inward, flat (no shadow)
   - identical transition duration and easing
   `brut-pop` stays as an alias so existing markup keeps working, and card control
   buttons are switched over to the shared utility.
2. Apply the shared interaction utility to the clickable variants that are missing it:
   - FAB in `AppShell.tsx` (already `brut-press`, verified against the new scale)
   - Card control buttons in `CountdownCard.tsx` (edit, delete, archive, restore,
     download, confirm, cancel)
   - Modal / form buttons in `CreateCountdownForm.tsx`, `LocalImport.tsx`,
     `CountdownGrid.tsx`, `BrutalDateTimePicker.tsx`, `CountdownCalendar.tsx`
   - Auth controls and header nav buttons
3. Non-interactive elements — the hourglass status badge, tooltips, category chips,
   panels — keep a static shadow from the same token scale (`--shadow-brut-sm`) and
   explicitly do not animate, so they read as labels rather than buttons.
4. `brut-lift` (card hover) keeps its rotation flourish but uses the same hover
   shadow token.

## Technical notes

- All values keep coming from the existing tokens in `src/styles.css`:
  `--shadow-brut` (3px), `--shadow-brut-sm` (2px), `--shadow-brut-hover` (4px),
  `--shadow-brut-none`, `--shadow-brut-slate`.
- Edits are confined to `src/styles.css` plus className swaps in the components
  listed above; no logic or data changes.
- The Sonner toast button overrides in `src/styles.css` are updated to reference the
  same utility rules so toast actions match app buttons.
