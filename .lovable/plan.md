# Open button in the countdown card controls

## What to build

Add an **Open** button to the controls that appear when you hover (or tap) a
countdown card — the same bar that already holds Edit tags, Download and
Delete. Tapping it opens that countdown's full-screen page
(`app.daystogo.xyz/<its ID>`).

- Same look as the other controls: a small square, thick black border, hard
  offset shadow, icon-only.
- Icon: an expand/full-screen glyph, so it reads as "make this bigger".
- It sits at the left end of the bar, so it's in the same spot whether the
  countdown is running, lapsed or archived.
- Hovering shows the same tooltip the other controls use ("Open"), and the
  button is announced to screen readers as "Open countdown".
- Because it's a real link, it keeps the browser's normal behaviour:
  middle-click or cmd-click opens the page in a new tab, and the page transition
  stays smooth.

Nothing else changes: the title stays clickable, and the bar still only appears
on hover/tap.

## Technical

- `web_app/src/components/CountdownCard.tsx`: import `Maximize2` from
  `lucide-react` and render a `<Link to="/$countdownId"
  params={{ countdownId: countdown.id }} viewTransition>` as the first child of
  the controls row's `<div className="flex flex-nowrap gap-2">`, before the
  Edit tags button.
- Style it identically to the Download/Delete buttons:
  `brut-thin brut-press flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-cream`
  with `aria-label="Open countdown"`, `title="Open"`, and the icon at
  `h-4 w-4 strokeWidth={3}` (aria-hidden, since the button carries the label).
- The row already stops pointer-down propagation, so the existing tap-to-reveal
  logic won't swallow the click on touch devices.
- No new route, database field or migration — the page at `/$countdownId`
  already exists and is reached today by clicking a card title.
