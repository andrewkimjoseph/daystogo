# Smooth transitions across Days To Go

Make route changes and date/time picker interactions feel fluid instead of snapping, while keeping the brutalist look (no soft fades that mush the hard edges — short, bouncy, purposeful motion).

## What changes

### 1. Route transitions
- Turn on view transitions in the router so navigating Home ⇄ New ⇄ About cross-fades/slides instead of hard-cutting.
- Header stays visually anchored: the logo/nav gets a stable transition name so it doesn't flicker between routes.
- Page bodies animate in with a short upward slide (reusing the existing `slide-up` / bounce easing already in the styles).
- Links that navigate (header pills, floating "New" button, empty-state button, back links) opt into the transition.

### 2. Date/time picker transitions
- Switching between the day grid, month grid, and year grid animates as a quick scale/slide swap rather than an instant swap.
- Month/year arrow navigation slides the grid in the direction of travel (next = in from right, prev = in from left).
- Hour/minute steppers animate the changing numeral with a tiny tick/pop so holding the arrows reads as motion.
- Selecting a day gets a snappier press/select response.

### 3. Accessibility & performance
- Everything wrapped so `prefers-reduced-motion: reduce` disables the animations entirely.
- Durations kept in the 120–260ms range so the app never feels laggy.

## Technical notes

- `src/router.tsx`: add `defaultViewTransition: true` (with `defaultPreload: "intent"` so pages are ready before the transition starts).
- `src/styles.css`: add `::view-transition` group rules, named transition for the header, direction-aware keyframes for the picker panes, and a `@media (prefers-reduced-motion: reduce)` block that zeroes them out.
- `src/components/SiteHeader.tsx`: `viewTransition` on `Link`s, `view-transition-name` on the header shell.
- `src/routes/index.tsx`, `create-countdown.tsx`, `about.tsx`: wrap page content in the enter animation utility.
- `src/components/BrutalDateTimePicker.tsx`: track navigation direction, key the animating grid on `pane` + `view` so React remounts it and the CSS animation replays; animate stepper numerals on value change. No changes to date logic or output format.
- `src/components/CountdownGrid.tsx` / `AppShell.tsx`: add `viewTransition` to the navigating links.

No data-layer, countdown, or persistence behavior changes.
