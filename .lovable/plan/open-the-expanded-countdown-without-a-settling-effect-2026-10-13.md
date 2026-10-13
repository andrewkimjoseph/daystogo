# Open the expanded countdown without a settling effect

## What changes
- Show the expanded countdown upright at its final size, without the opening tilt, zoom or bounce.
- Prevent a briefly oversized or clipped timer before its width is calculated.
- Keep the final appearance, left alignment, live ticking and width-filling timer unchanged. Other pages and regular countdown cards keep their existing animations.

## Technical approach
- Remove `animate-pop-in` from the expanded countdown article. This animation scales and rotates the card while the fitted timer currently measures its text with `getBoundingClientRect()`.
- Measure text using untransformed layout dimensions so an ancestor’s animation cannot distort the fitted font size.
- Perform the first measurement before paint where possible, and keep the readout invisible until a valid fit is ready. Refit after font loading and resizing without an animated size transition.
- Disable the page-entry movement for this countdown view only, without changing shared animation behaviour on other pages.

## Verification
- Open a countdown from a card and reload its address with short and long readouts.
- Check the opening frames as well as the settled view: no tilted card, bounce, oversized text or clipping.
- Verify desktop and phone widths, resizing and live ticking; retain the same full-width final readout.