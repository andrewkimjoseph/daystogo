# A browsable /calendar page with marked countdown dates

A new page at `/calendar` where you can flip through months and years and see which days already have countdowns on them.

## What you get

- **Month view you can explore.** Same brutalist calendar look as the create page: arrows for previous/next month and year, tap the month or year label to jump via a month grid or a 12-year grid. Today is outlined.
- **Marked days.** Any day that has a countdown ending on it gets a marker: a small colored bar/dot under the date number using that countdown's color tag. Multiple countdowns on one day show up to three markers plus a "+N".
- **Tap a day to see what's on it.** Selecting a marked (or any) day shows a panel listing the countdowns ending that day — title, category icon, end time, status (running / paused / lapsed), each linking back to the timers grid. Empty days show a short "nothing on this day" nudge with a link to create a countdown.
- **Header + nav.** A "Calendar" link in the site header, and a right-aligned "Back to the timers" button below the navbar, matching About and New Countdown.
- **Responsive.** Single column on mobile (calendar, then the day panel); two columns on desktop.
- **SEO.** Route-specific title, description, og tags, canonical `https://www.daystogo.xyz/calendar`, and the page added to the sitemap.

## Technical notes

- New route `src/routes/calendar.tsx` with `createFileRoute("/calendar")`, its own `head()`, rendered inside `AppShell`.
- New component `src/components/CountdownCalendar.tsx`: month/year/day pane navigation reusing the existing grid + animation approach from `BrutalDateTimePicker.tsx` (Monday-first 42-cell grid, `swap-left`/`swap-right`/`swap-zoom` classes). Kept separate from the picker so the create-countdown form is untouched.
- Data via `useLiveQuery(() => countdownsRepo.all())`, plus `countdownsRepo.reconcile()` on mount, same as `CountdownGrid`. Countdowns are bucketed by local `YYYY-MM-DD` of `endsAt` (paused rows use their projected end from `pausedRemainingMs`).
- Day list rendered by a small local sub-component; reuses `categoryMeta` and `formatTargetLabel`. No schema, repo, or business-logic changes.
- `src/routes/sitemap[.]xml.ts` gains the `/calendar` entry; `SiteHeader.tsx` gains the nav link.
