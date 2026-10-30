# Remove "How far along" from the expanded countdown

On the expanded countdown page (the only place this label appears in the web app), remove the row above the progress strip: the "HOW FAR ALONG" label and the percentage beside it.

Stays as is: the segmented progress strip, the "Started …" / "Lands …" dates under it, regular cards, and downloads.

## Technical details
- `web_app/src/routes/countdowns.$countdownId.tsx`: delete the label/percent `div` (around line 250). Keep the strip's `aria-label` with the percentage so screen readers still get the progress.
