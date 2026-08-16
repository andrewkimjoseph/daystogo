# Share a countdown as a PNG

Add a download button to every countdown card that saves a crisp 1080x1080 PNG of that countdown, ready to post or send to friends.

## What the user gets

- A small download icon next to the Edit tags / delete buttons on each card (also on lapsed cards).
- Tapping it renders a square share image and downloads it as `days-to-go-<title>.png`.
- A brief toast confirms the download (or reports failure).

## What the share image looks like

Square 1080x1080, same brutalist look as the card: cream dotted background, offset hard-shadow panel, ink border, sharp corners.

```text
+------------------------------------------+
|  [ dotted cream field ]                  |
|   +----------------------------------+   |
|   |  ICON  CATEGORY        RUNNING   |   |
|   |  COUNTDOWN TITLE                 |   |
|   |  ENDS SAT 19 SEPT, 22:32:00      |   |
|   |                                  |   |
|   |   34d 00:59:40                   |   |
|   |                                  |   |
|   |  [][][][][][][][][][][][][][][]  |   |
|   +----------------------------------+   |
|   [logo]                app.daystogo.xyz |
+------------------------------------------+
```

Lapsed countdowns use the mauve-to-red gradient panel and the "Lapsed!" badge, matching the card.

## Technical approach

- New `src/lib/shareImage.ts`: draws the whole composition on a 1080x1080 `<canvas>` with the 2D API (no new dependency, no DOM-to-image quirks), then exports via `toBlob` and an anchor download.
  - Reuses existing logic for the values: `remainingMs`, `formatRemaining`, `progressPercent`, `formatTargetLabel`, `categoryMeta`, `PALETTE`.
  - Colours read from `PALETTE` constants (not CSS vars, which canvas can't resolve).
  - Waits on `document.fonts.ready` so the display typeface is used; falls back to a bold sans stack.
  - Title wraps to at most 3 lines with auto-shrinking font size so long titles never clip; countdown text scales the same way.
  - Logo drawn from the existing `@/assets/logo.png` import, loaded as an `Image` before export.
- `src/components/CountdownCard.tsx`: add the download button (lucide `Download`), local `saving` state to prevent double-clicks, and `sonner` toast feedback. `<Toaster />` gets mounted once in `src/routes/__root.tsx` if not already present.
- Client-only: the export runs on click, so nothing affects SSR or hydration.
