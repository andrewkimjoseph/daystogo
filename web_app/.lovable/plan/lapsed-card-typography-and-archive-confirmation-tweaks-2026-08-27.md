# Lapsed card typography and archive confirmation tweaks

## What changes

1. **Keep lapsed time the same size as running countdowns.**  
   In `src/components/CountdownCard.tsx`, the lapsed timer currently inflates to the dramatic `text-4xl sm:text-6xl` size. Change it to always use the standard `text-3xl sm:text-4xl` size so the time font stays consistent before and after lapsing.

2. **Improve archive confirmation contrast.**  
   The "Box it up?" confirmation bar currently uses `PALETTE.mauve` on the red lapsed card. Swap it to a higher-contrast color (cream background with dark ink text, or teal with cream text) so it is clearly readable.

3. **Make the three lapsed action buttons span the full card width.**  
   The lapsed control row shows Download, Archive/Restore, and Delete as three fixed-width `w-11` icon buttons that leave whitespace on the right. Replace the fixed widths with `flex-1` so the buttons share the entire row and fill the lapsed card.

## Technical notes

- File: `src/components/CountdownCard.tsx` (lines 205-210 for the timer, lines 372-470 for the archive confirmation and control row).
- Keep the existing hover/tap reveal behavior, icon-only labels, and confirmation flow unchanged.
- The change is local to the card component only; no new dependencies, routes, or database schema changes are required.
