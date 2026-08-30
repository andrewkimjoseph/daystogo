# Hourglass emoji loader, centered everywhere

## What the user wants
The loading spinner should be the hourglass **emoji** (⏳) instead of the Lucide icon, and it should sit perfectly centered wherever a loading state appears.

## Changes

1. **`src/components/HourglassLoader.tsx`** — single source of the loader:
   - Replace the Lucide `<Hourglass>` icon with the `⏳` emoji (matching the running-badge emoji already used on cards and PNG exports).
   - Keep the spinning animation (`animate-hourglass-spin`) and the brutalist chip (`brut-thin bg-card`).
   - Keep `role="status"` and `aria-label="Loading"` for accessibility.
   - Guarantee centering: the outer wrapper keeps `flex items-center justify-center` and gets `w-full` plus a minimum height (`min-h-40` / full-column centering) so it centers horizontally and vertically in every parent, not just within its own content box.

2. **Verify all usages render centered** (no code change expected — they all consume `HourglassLoader`):
   - `CountdownGrid.tsx` (home + archived boards)
   - `AuthGate.tsx`
   - `LocalImport.tsx`

3. **Check for any other loading states** (e.g. `CalendarSkeleton`, route fallbacks) and swap any non-hourglass spinners to `HourglassLoader` so the spinning emoji is the one loading indicator across the app.

## Verification
- Typecheck/build passes.
- Playwright: load `/` signed-out, confirm the ⏳ loader appears centered in the countdown area while data loads.
