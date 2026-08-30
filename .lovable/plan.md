# Spinning hourglass loading icon

## What changes

Right now the app shows nothing while loading — the blank content area in your screenshot is `CountdownGrid` returning `null` while countdowns load. Same for `AuthGate` (auth loading) and `LocalImport` (checking for local countdowns to import).

1. **New `HourglassLoader` component** (`src/components/HourglassLoader.tsx`)
   - Lucide `Hourglass` icon inside a small brutalist chip (brut-thin border + shadow, cream card bg, teal icon) — matches the card badges' look.
   - Spins continuously via a new `spin`-based animation token in `src/styles.css` (a slow 1.2s rotate, disabled under `prefers-reduced-motion`, falling back to the existing pulse).
   - Centered in its container, with `role="status"` and an `aria-label="Loading"` for screen readers.

2. **Use it everywhere loading happens**
   - `CountdownGrid.tsx`: replace `if (!countdowns) return null` with the loader (this fixes the blank page in your second screenshot).
   - `AuthGate.tsx`: replace `if (!isLoaded) return null` with the loader.
   - `LocalImport.tsx`: replace the `checking` phase `return null` with the loader.

## Files

- `src/components/HourglassLoader.tsx` (new)
- `src/styles.css` (spin animation utility + reduced-motion guard)
- `src/components/CountdownGrid.tsx`
- `src/components/AuthGate.tsx`
- `src/components/LocalImport.tsx`

## Notes

- Pure presentation — no data, routing, or behavior changes.
- The empty-state "No countdowns yet" card and the "Importing your countdowns…" card stay as they are; only the silent blank states get the spinner.
