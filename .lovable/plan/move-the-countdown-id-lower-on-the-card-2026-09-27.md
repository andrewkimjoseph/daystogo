# Move the countdown ID lower on the card

Put the "ID / …" line further down, closer to the card's bottom edge, instead of sitting tight under "CREATED ON".

## Change
- Take the ID out of the created-date block and give it its own row at the very bottom of the card, below the "CREATED ON" + logo row.
- Add a little space above it, so it sits apart from the created date and close to the bottom border.
- Keep it clear of the colour corner on the right, and keep the same small, muted, uppercase style.
- The downloaded image stays as it is, since its ID already sits low beneath the progress bar.

## Technical details
- `web_app/src/components/CountdownCard.tsx`: remove the ID `<p>` from the footer's `min-w-0` wrapper, and render it after the footer row as `mt-2 -mb-1 break-all pr-8 text-[9px] font-bold uppercase`. It still shows only when `isSignedIn`.
- Verify with a Playwright screenshot of a signed-in card.
