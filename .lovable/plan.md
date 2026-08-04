# Refresh README.md

Bring the README in line with how the app actually works today.

## What changes

**Links / URLs**
- Live link becomes `https://app.daystogo.xyz` (currently points to `daystogo.xyz`).
- Keep the GitHub author link.

**Features section**
- Duration mode caps at 24 hours (hours/minutes/seconds only — no days), while target mode has no ceiling (seconds out to years).
- Drop the pause/resume claim — countdowns can't be paused. Instead: countdowns run to zero, then celebrate and can be re-run or deleted.
- Add the `/calendar` page: browse months and years, days with countdowns are marked, and a day panel with live-ticking entries plus a "New countdown" shortcut that pre-fills the end date.
- Add inline card editing: rename the goal (auto-uppercase), change color and category from an overlay that saves and closes on click-away; tooltips name each color and category.
- Note cards are sorted soonest-ending first.
- Mention all long dates include seconds.
- Keep: categories + filter, confetti + chime at zero, mute toggle, custom brutalist date/time picker with typable time, local-first Dexie persistence, view transitions, responsive layout.

**Tech stack**
- Vite 8, TanStack Router/Start v1, React 19, Tailwind v4, Dexie 4, date-fns, canvas-confetti, lucide-react, Zod, TypeScript.

**Project structure**
- Add missing files: `CountdownCalendar.tsx`, `src/hooks/` (`useCountdownTick`, `useHydrated`, `use-mobile`), `routes/calendar.tsx`, `routes/sitemap[.]xml.ts`, and `src/lib/utils.ts`. Fix the route filenames/comments.

**Dev section**
- Keep the npm scripts table; add `npm run build:dev`.

## Scope
Only `README.md` is edited. No app code or behavior changes.
