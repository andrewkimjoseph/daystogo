# Categories fill the left column, time rejoins the calendar

The typable time block moves back beside the calendar in the right card, and the space it leaves on the left gets a proper purpose: a category for the countdown.

## What changes

**1. Right card (End time mode)**

- Calendar (year row, month row, day grid, month/year panes) with the hour/minute typable field + steppers and the "That's 57 minutes from now." summary underneath it, all in one card — as it was before the split, but with the typable inputs kept.

**2. Left card: Category**

- New "Category" block below Colour tag, present in both Duration and End time modes.
- A grid of square brutalist buttons (2 columns on mobile, 3 on desktop), one per category, each with a small icon + label. Selected state uses the mauve/cream treatment already used by the mode switch.
- Categories (fixed list, single select, optional — defaults to "Other"):
  - Financial
  - Health & Fitness
  - Work & Career
  - Personal Milestones
  - Travel
  - Events
  - Learning & Goals
  - Home & Life Admin
  - Relationships & Family
  - Tech & Digital
  - Fun & Random
  - Other
- Each category shows a one-line hint under the grid for the currently selected one (e.g. Financial — "paying off a loan, saving up, next payday, subscription renewal") so the examples are visible without cluttering the buttons.

**3. Countdown cards**

- The category shows as a small uppercase label with its icon above the title, in muted ink (cream when lapsed), so the grid reads at a glance.

**4. Filtering (small, follow-on benefit)**

- Home page gets a horizontal row of category chips ("All" + only the categories in use) that filters the grid client-side. No layout change to the cards themselves.

## Technical notes

- New `src/lib/categories.ts`: `CountdownCategory` union, ordered list of `{ key, label, hint, icon }` using lucide icons, plus a `categoryOf(c)` helper that falls back to `"other"` for existing rows.
- `src/lib/db.ts`: add optional `category?: CountdownCategory` to `Countdown`, bump Dexie to version 3 with `category` indexed (`id, status, endsAt, createdAt, targetAt, category`). Old rows keep working via the optional field.
- `src/lib/countdownsRepo.ts`: accept `category` on both `NewDurationInput` and `NewTargetInput`, store it on create.
- `src/components/CreateCountdownForm.tsx`: new `category` state, category grid in the left card; `BrutalTimeField` moves into the right card under `BrutalCalendar`; hydration placeholder heights adjusted (right card back to ~580px, left card no longer reserves time-field space).
- `src/components/CountdownCard.tsx`: render the category line in the header block above the title.
- `src/components/CountdownGrid.tsx`: local `filter` state + chip row; empty state unchanged when no countdowns exist at all.
- Verify with Playwright at 390px and 1280px: create one countdown per mode with a category, confirm the card label and the filter chips.
