# Days To Go

A playful, brutalist countdown timer web app. Run as many clocks as you like — from 3 seconds to years out — ticking down to the second, with a burst of confetti and a chime when the timer hits zero. Local-first: your timers live in your browser, so there's no account and no server to trust. Put a clock on it.

**Live:** [daystogo.xyz](https://daystogo.xyz) · **Source:** [github.com/andrewkimjoseph](https://github.com/andrewkimjoseph)

## Features

- **Countdowns that tick to the second** — every card updates live, all on one shared clock. No max-day cap: from 3 seconds out to ~100 years.
- **Two modes** — set a duration (3s and up) or pick a specific end date & time in your local timezone. Start the clock and it runs until then.
- **Categories** — tag each countdown (Financial, Health, Work, …) and filter the grid by category.
- **Celebrate at zero** — confetti burst and a chime when a timer lapses. Pause, resume, or run it again.
- **Mute toggle** — turn sound off without losing the confetti.
- **Custom brutalist date/time picker** — an inline calendar with year/month/day panes and typable time steppers, styled to match the platform. No native browser pickers.
- **Local-first persistence** — timers are stored in IndexedDB via Dexie. No login, no cloud sync, no server.
- **View transitions** — route changes and picker panes animate with a bouncy, fluid feel.
- **Responsive** — laid out for mobile and desktop, with consistent alignment across every route.

## Design

A "Playful Brutalist" aesthetic: a cream base (`#EFEADD`), thick black borders, hard offset shadows, sharp 90-degree corners, and a punchy palette — teal `#2E9EAC`, mauve `#A24962`, red `#CD2744`, slate blue `#426A85`. A subtle dot grid sits behind the content.

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, SSR/SSG) on Vite 8
- **Styling:** Tailwind CSS v4 with native `@theme` tokens
- **Persistence:** [Dexie](https://dexie.org) (IndexedDB) for local-first countdown storage
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
│   ├── CountdownCard.tsx         # single ticking card, pause/resume, celebrate
│   ├── CreateCountdownForm.tsx   # /create-countdown form (mode, category, picker)
│   ├── BrutalDateTimePicker.tsx  # custom calendar + typable time steppers
│   ├── MuteToggle.tsx
│   └── Sparkle.tsx
├── lib/
│   ├── db.ts                     # Dexie schema (countdowns + categories)
│   ├── countdownsRepo.ts         # CRUD + time reconciliation
│   ├── formatTime.ts             # human time formatting (to the second)
│   ├── localTime.ts              # localized "Ends…" labels with year
│   ├── categories.ts
│   ├── palette.ts
│   ├── soundManager.ts
│   └── confetti.ts
└── routes/
    ├── __root.tsx
    ├── index.tsx                 # home — the grid of timers
    ├── create-countdown.tsx       # new countdown flow
    └── about.tsx                  # about + link to GitHub
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

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                  |
| `npm run build`   | Production build                     |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |
| `npm run format`  | Format with Prettier                 |

## Data & privacy

Countdowns are stored only in your browser's IndexedDB. Nothing is sent to a server, there's no account, and clearing your browser storage clears your timers.

## Author

Built by **Andrew Kim Joseph** — [github.com/andrewkimjoseph](https://github.com/andrewkimjoseph).
