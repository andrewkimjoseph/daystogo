# Scrollable day list on the calendar page

## Problem

On `/calendar`, when a day has many countdowns, the right-hand day panel keeps growing taller, stretching the whole calendar layout.

## Fix

In `web_app/src/components/CountdownCalendar.tsx`, cap the countdown list inside `DayPanel` and let it scroll internally:

- Give the `<ul>` of countdown rows a fixed maximum height (roughly matching the calendar grid's height) with `overflow-y-auto`, so the panel — and the calendar beside it — stays the same size no matter how many countdowns land on that day.
- Keep the heading, the "N countdowns lands here" line, and the "New countdown" button pinned above the scrollable list.
- Add a touch of right padding inside the scroll area so the scrollbar doesn't overlap the cards.
- Days with few or zero countdowns render exactly as they do now — no empty scroll area.

## Verification

- Seed a day with many countdowns locally and check with Playwright (desktop and mobile widths) that the calendar grid no longer grows, the list scrolls, and all rows are reachable.
- `bunx tsgo --noEmit` in `web_app` stays clean.
