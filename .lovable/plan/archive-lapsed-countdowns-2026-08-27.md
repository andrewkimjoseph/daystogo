# Archive lapsed countdowns

Add an "Archive" action to lapsed countdown cards and a new `/archived` page that holds them, so the home grid stays focused on live clocks.

## What changes

- **Lapsed cards** get an ARCHIVE button (box icon) alongside SAVE PNG and DELETE. Tapping it moves the card off the home grid instantly.
- **New `/archived` route** shows every archived countdown in the same card grid, with its own header copy and an empty state ("Nothing archived yet"). From there each card can still be saved as PNG, deleted, or unarchived (RESTORE button).
- **Home grid** hides archived countdowns; the category filter bar only counts the visible ones.
- **Calendar** keeps showing markers for live countdowns only; archived ones drop out of the month grid and day panel.
- **Header nav** gets an ARCHIVE link next to CALENDAR/ABOUT (icon-only on small screens to avoid crowding).

## Technical notes

- `src/lib/db.ts`: add optional `archivedAt?: number` to `Countdown` and a Dexie `version(4)` store with `archivedAt` indexed. Optional field means existing rows need no migration (undefined = not archived).
- `src/lib/countdownsRepo.ts`: `all()` filters out rows with `archivedAt` set; add `archived()` (sorted by `archivedAt` desc), `archive(id)`, and `unarchive(id)`.
- `src/components/CountdownCard.tsx`: new `onArchive`/`onUnarchive` handling driven by a prop (e.g. `variant: "active" | "archived"`) so the archived page swaps ARCHIVE for RESTORE. Edit-tags overlay stays disabled for lapsed cards as today.
- New `src/routes/archived.tsx` + reuse of the existing grid component (extract the shared grid body so both pages share filtering/card rendering) with its own `head()` metadata: unique title, description, og:title, og:description, og:type, and canonical `https://app.daystogo.xyz/archived`.
- `src/routes/sitemap[.]xml.ts`: add `/archived`.
