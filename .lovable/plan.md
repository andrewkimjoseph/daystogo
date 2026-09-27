# Show the countdown ID on cards and downloads

For signed-in users (whose countdowns are synced to the cloud), show the countdown's ID, e.g. `ID / 94b40611-9a5f-4766-9b59-ea51e82e8588`, in the spot you marked: a small, quiet line under "CREATED ON …", to the left of the colour corner.

## Card
- New muted line in the same small uppercase style as "CREATED ON", right below it.
- It only shows when the user is signed in. Local-only (signed-out) users won't see it.
- Long IDs wrap or shrink so they never run into the colour corner.

## Downloadable PNG
- Same `ID / …` line, drawn small and muted in the space under the progress strip, left-aligned and kept clear of the colour corner.
- The type shrinks so the ID fits on one line. The panel grows a little if it needs to, so it stays inside the box.
- It's only added when the user is signed in.

## Technical details
- `CountdownCard.tsx`: read the signed-in state from Clerk (same hook as CountdownGrid/AuthGate), then render `countdown.id` below the created line (~line 525). The Dexie id is the same id stored in Neon once synced.
- `shareImage.ts`: add an optional `{ showId?: boolean }` option to `renderCountdownShareImage`/`downloadCountdownImage`, and draw the id with `fitLines`-style shrink between the strip and the panel's bottom border.
- Verify with Playwright on desktop and mobile.
