# Consistent navbar across routes

The header is currently duplicated in two places with different widths and different link sets, so it visibly shifts between the timers page and the About page.

- Home (`/`): header container is `max-w-6xl`, shows an "About" pill + mute toggle.
- About (`/about`): header container is `max-w-3xl`, shows a "Home" pill + mute toggle.

Result: the logo and controls sit at different horizontal positions, and the bar feels narrower on About.

## What to change

1. Create one shared `SiteHeader` component that owns the whole bar: cream background, thick bottom border, logo (always linking home), and the right-side controls.
2. Fix the header's inner container to a single width (`max-w-6xl`) with the same padding and vertical rhythm on every route, so the bar never resizes.
3. Keep the nav links route-aware inside that one component: show "About" when on `/`, "Home" when on `/about` — same pill styling, same slot, same height, so nothing jumps.
4. Use the shared header in both `AppShell` (home) and the About route, removing both copies of the markup.
5. Leave page content widths alone: About keeps its narrower `max-w-3xl` body, only the header spans the shared width.

## Technical notes

- New file `src/components/SiteHeader.tsx`; logo asset and `MuteToggle` move into it.
- `src/components/AppShell.tsx` and `src/routes/about.tsx` render `<SiteHeader />` instead of their own `<header>` blocks.
- Link visibility uses the router's current path (`useRouterState`/`useMatchRoute`) rather than props, so future routes get the correct default automatically.
- Icon/pill sizes stay as-is (`h-14 sm:h-16` logo) — this is purely a de-duplication plus width alignment.
