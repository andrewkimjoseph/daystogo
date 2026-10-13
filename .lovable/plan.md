# Make the expanded timer fill the available width

## What changes
- Enlarge the timer on `/countdowns/{id}` to fill almost all the card’s inner width, with a small safety margin.
- Keep it left-aligned, on one line, and fully inside the card.
- Fit each readout individually: shorter times grow larger, while longer times shrink only enough to fit.
- Keep the title, dates, progress strip, colour corner, regular countdown cards and downloads unchanged.

## Technical approach
- Replace the expanded timer’s current `clamp(1.25rem,6.2cqi,6rem)` sizing, which caps its size without accounting for the actual text width.
- Use a focused fitted-timer component that measures the rendered font and available container width, then calculates the largest fitting font size without the existing 6rem ceiling.
- Recalculate after font loading and container resizing. Reserve enough vertical room for the fitted readout so it does not overlap the title or progress strip.
- Use tabular numerals and a stable size while seconds tick; refit when the visible unit structure changes rather than producing a size jump every second.
- Keep measurement browser-side, clean up observers, and preserve a safe initial size before measurement.

## Verification
- Check short, medium and long readouts, including `2mo 4wk 22:13:48` and `11mo 4wk 6d 23:59:59`.
- Verify at 1920, 1280, 1179 and 390px widths that the timer fills the available width without clipping, wrapping or overlapping neighbouring content.
- Resize a live countdown and watch it tick to confirm fitting remains stable.