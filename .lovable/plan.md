# Keep the big timer inside the card on the countdown page

## The problem
On a countdown's own page, long readouts like "2mo 4wk 1d 03:28:27" spill past the right edge of the card. The timer's size follows the width of the whole window, not the card. So on some screen widths it ends up bigger than the card can hold.

## The fix
- The timer's size will follow the width of the card. It will always fit on one line, starting at the left padding and ending before the right padding.
- It stays as big as possible, with the same top limit as now, so short readouts still look huge.
- Nothing else on the page changes: title, progress strip, dates and colour corner stay the same.

## Technical
- `web_app/src/routes/countdowns.$countdownId.tsx`: wrap the timer `<p>` in a div with `[container-type:inline-size]` and `w-full min-w-0`. Change the font size from `clamp(1.75rem,7vw,6rem)` to a container-relative `clamp(1.25rem,9cqi,6rem)`, tuned so the longest format ("11mo 4wk 6d 23:59:59") fits. Also add `overflow-hidden` as a safety net.
- Check with Playwright at 1920, 1280, 1024 and 390px widths, using a long readout. The timer's right edge must stay inside the card's content box.
