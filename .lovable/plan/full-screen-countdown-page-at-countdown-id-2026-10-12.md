# Full-screen countdown page at /{countdown id}

Each countdown gets its own page, e.g. `app.daystogo.xyz/94b40611-9a5f-4766-9b59-ea51e82e8588`. The page shows that one countdown big, about the size of the calendar, so you can take it in at a glance.

## What the page shows
- The normal header with a Home button.
- One large card, as wide as the calendar page, in the usual brutalist style with the colour corner:
  - The category icon and label, and the ⏳ (or ⌛ once it has lapsed) badge.
  - The title, very large.
  - The target date, with seconds, plus the repeat icon and label (WEEKLY and so on) if it repeats.
  - The live timer, as large as fits on one line, left-aligned, using the same units as the cards (y mo wk d HH:MM:SS).
  - A "how far along" section: a wide progress strip, the percentage elapsed, and "started on …" next to "lands on …".
  - A small "Created on …" line and, for signed-in users, the "ID / …" line at the bottom.
  - Download PNG and Copy link buttons.
- When the countdown lapses, the page shows the lapsed style and plays the confetti and sound, just like the card on the board.
- If the ID doesn't match any countdown on this device or account, a brutalist "Countdown not found" message with a link home.

## Getting there
- Clicking a card's title on the home board, archived page, or calendar day list opens its page. The hover controls keep working as they do now.

## Technical
- New `web_app/src/routes/$countdownId.tsx` (`createFileRoute("/$countdownId")`). Fixed pages like /calendar and /about still take priority over it.
- The data is read in the browser (from Dexie, or from the cloud when signed in) through the existing `countdownsRepo` and query key, shown behind `useHydrated` with the hourglass loader, so there's no server 401 or hydration mismatch. Add `countdownsRepo.byId(id)`, which also finds archived rows.
- Reuse `useCountdownTick`, `formatTime`, `recurrenceBadgeLabel`, `downloadCountdownImage`, and the lapse/celebrate logic from CountdownCard.
- The page gets its own `head()` with the title "Countdown — Days To Go" and `noindex`, because each page is private to its owner's device or account.
- Add the title `Link`s in CountdownCard.tsx and CountdownCalendar.tsx.
