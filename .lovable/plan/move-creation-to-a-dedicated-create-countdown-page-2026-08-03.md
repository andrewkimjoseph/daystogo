# Move creation to a dedicated /create-countdown page

The new-countdown modal has outgrown a dialog — on mobile it fills the screen and scrolls awkwardly. Creation moves to its own full page, and the whole flow gets a proper mobile pass.

## What changes

### New route `/create-countdown`
- A full page with the shared site header, its own SEO `head()` (title, description, og:title, og:description), and an `<h1>` "New countdown".
- Contains the whole creation form, laid out with room to breathe:
  - Mode switch (Duration / End time)
  - Title field
  - Duration inputs, or the date/time picker
  - Colour tag row
  - Error block and "Start the clock" submit
- On desktop the page becomes two columns: form controls on the left, the calendar/time picker (or a live "this is what you're setting" summary in Duration mode) on the right. Single column on mobile.
- Submitting creates the countdown, plays the start sound, and navigates back to `/`.
- A "Back to the timers" link, matching the about page.

### Home page
- The floating "New countdown" button and the empty-state button become links to `/create-countdown` instead of opening a modal.
- `AppShell` drops its modal state and the `children(openNew)` render-prop shape; `CountdownGrid` no longer needs an `onNew` callback.
- `NewCountdownModal.tsx` is deleted, its form logic moving into the new page.
- Header gets a "New" link so creation is reachable from the about page too, and the About/Home link stops being hidden on mobile.

### Responsive pass
- Date picker: full-width month/year rows, larger tap targets for day cells (min 44px tall), presets stack two-up on narrow screens instead of four across.
- Time steppers get bigger touch targets on mobile.
- Duration type buttons wrap into a 2x2 grid on small screens instead of squeezing four across.
- Countdown cards: check numeral sizes and the days+clock string at 320-390px widths so long strings like `152d 08:12:47` don't overflow.
- Header, hero copy, and grid re-checked at mobile widths using the grid + `min-w-0` + `shrink-0` pattern.

## Technical notes

- New file `src/routes/create-countdown.tsx` with `createFileRoute("/create-countdown")`; form body extracted into `src/components/CreateCountdownForm.tsx` so the route file stays thin.
- Navigation via `useNavigate()` after `countdownsRepo.create(...)` resolves; `<Link>` for all button-style navigation.
- No data-layer changes — `countdownsRepo`, Dexie schema, validation and `spanFromNow` are reused as-is.
- Verify with Playwright at 390x844 and 1280 wide: create a duration countdown and a target countdown end-to-end, screenshot both widths.
