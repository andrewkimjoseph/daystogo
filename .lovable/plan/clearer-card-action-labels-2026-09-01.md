# Clearer card action labels

Replace the jokey, ambiguous wording on the countdown card controls with labels that say exactly what each action does.

## What changes

All in `src/components/CountdownCard.tsx` — copy changes only, no layout, icon, or behavior changes.

1. **Delete confirmation bar** ("Nuke this countdown?")
   - Question becomes: "Delete this countdown for good?"
   - Confirm button title/aria-label becomes "Delete" (icon stays the check).
   - Cancel button title/aria-label becomes "Cancel" (icon stays the X).

2. **Archive confirmation bar** ("Box it up?")
   - Question becomes: "Archive this countdown?"
   - Confirm button title/aria-label becomes "Archive".
   - Cancel button title/aria-label becomes "Cancel".

3. **Rest of the control row stays as-is**: Edit, Save PNG, Archive/Restore, and Delete keep their current icons, tooltips, and behavior. Toast copy ("Moved to the archive") is already clear and unchanged.

## Notes

- The confirm/cancel buttons are icon-only `h-9 w-9` squares; only their `title` and `aria-label` text change, so nothing reflows.
- The earlier feedback that confirm/cancel are shown as icons (not "DO IT"/"NOPE" text) is preserved — we're only fixing the wording that still says "Nuke", "Box it up", "Do it", and "Nope".
