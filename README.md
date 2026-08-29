# Days To Go

A playful, brutalist countdown timer web app. Run as many clocks as you like — a quick 3-second timer or a date years out — ticking down to the second, with a burst of confetti and a chime when the timer hits zero. Sign in and your timers follow you. Put a clock on it.

**Live:** [app.daystogo.xyz](https://app.daystogo.xyz) · **Source:** [github.com/andrewkimjoseph](https://github.com/andrewkimjoseph)

## Features

- **Countdowns that tick to the second** — every card updates live on one shared clock, and the grid is sorted soonest-ending first.
- **Two modes** — set a **duration** (seconds, minutes, hours; capped at 24 hours) or pick a **specific end date & time** in your local timezone, which has no ceiling at all — seconds out to years.
- **Celebrate at zero** — a confetti burst and a chime when a timer lapses. Run it again or bin it. (Countdowns can't be paused — once a clock starts, it runs.)
- **Categories** — tag each countdown (Financial, Health, Work, …) and filter the grid by category.
- **Inline editing** — rename a goal (always uppercase) and change its color or category from an overlay on the card. It saves and closes when you click away; hovering a swatch or icon names it. The end time stays fixed.
- **Calendar page** — flip through months and years at `/calendar`. Days with a countdown are marked, and opening a day shows its countdowns with live-ticking time remaining, plus a **New countdown** shortcut that pre-fills that end date.
- **Seconds everywhere** — every long-form date label ("Lands on Mon, 3 Aug 2026, 23:27:05") includes seconds, so nothing is rounded away.
- **Mute toggle** — turn sound off without losing the confetti.
- **Custom brutalist date/time picker** — an inline calendar with year/month/day panes and typable, clamped time steppers, styled to match the platform. No native browser pickers.
- **Signed-in persistence** — timers live in Postgres (Neon), scoped to your Clerk account. First sign-in imports any older local IndexedDB countdowns.
- **View transitions** — route changes and picker panes animate with a fluid feel.
- **Responsive** — laid out for mobile and desktop, with consistent alignment across every route.

## Design

A "Playful Brutalist" aesthetic: a cream base (`#EFEADD`), thick black borders, hard offset shadows, sharp 90-degree corners, and a punchy palette — teal `#2E9EAC`, mauve `#A24962`, red `#CD2744`, slate blue `#426A85`. A subtle dot grid sits behind the content.

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) v1 (React 19, SSR/SSG) with TanStack Router, on Vite 8
- **Styling:** Tailwind CSS v4 with native `@theme` tokens
- **Auth:** [Clerk](https://clerk.com) via `@clerk/tanstack-react-start`
- **Persistence:** [Neon](https://neon.tech) Postgres with Row-Level Security, queried through TanStack Start server functions + [Drizzle](https://orm.drizzle.team). One-time import from IndexedDB (Dexie).
- **Dates:** [date-fns](https://date-fns.org)
- **Effects:** [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) for the lapse celebration
- **Icons:** [lucide-react](https://lucide.dev)
- **Validation:** Zod
- **Type:** TypeScript throughout

## Project structure

```
src/
├── components/
│   ├── AppShell.tsx              # page wrapper
│   ├── SiteHeader.tsx            # consistent navbar across routes
│   ├── CountdownGrid.tsx         # home grid + category filter
│   ├── CountdownCard.tsx         # single ticking card, inline edit, celebrate
│   ├── CountdownCalendar.tsx     # month/year calendar, marked days, day panel
│   ├── CreateCountdownForm.tsx   # /create-countdown form (mode, category, picker)
│   ├── BrutalDateTimePicker.tsx  # custom calendar + typable time steppers
│   ├── MuteToggle.tsx
│   └── Sparkle.tsx
├── hooks/
│   ├── useCountdownTick.ts       # shared one-second clock
│   ├── useHydrated.ts            # SSR-safe gate for time-dependent UI
│   └── use-mobile.tsx
├── lib/
│   ├── db.ts                     # Countdown type + Dexie (one-time local import)
│   ├── countdownsRepo.ts         # CRUD via TanStack Start server functions
│   ├── countdownsFn.ts           # createServerFn RPC (client-callable)
│   ├── server/
│   │   ├── schema.ts             # Drizzle users + countdowns tables
│   │   └── db.ts                 # Neon client with Clerk JWT + user upsert
│   ├── formatTime.ts             # human time formatting (to the second)
│   ├── localTime.ts              # localized "Ends…" labels with seconds
│   ├── categories.ts
│   ├── palette.ts
│   ├── soundManager.ts
│   ├── confetti.ts
│   └── utils.ts
└── routes/
    ├── __root.tsx                # app shell, head metadata
    ├── index.tsx                 # home — the grid of timers
    ├── create-countdown.tsx      # new countdown flow (accepts ?date=)
    ├── calendar.tsx              # calendar explorer
    ├── about.tsx                 # about + link to GitHub
    └── sitemap[.]xml.ts          # generated /sitemap.xml
```

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if you don't have them.

```sh
git clone https://github.com/andrewkimjoseph/<repo>.git
cd <repo>
npm i
npm run dev
```

The dev server runs on Vite. Scripts:

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build                     |
| `npm run build:dev` | Build in development mode            |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run ESLint                           |
| `npm run format`    | Format with Prettier                 |

## Data & privacy

Countdowns are stored in Neon Postgres, scoped to your Clerk account with row-level security. First sign-in on a browser that still has old local timers will import them once. Clearing the browser no longer deletes cloud timers.

## Author

Built by **Andrew Kim Joseph** — [github.com/andrewkimjoseph](https://github.com/andrewkimjoseph).
