# Colour-tag corner flash on cards and downloads

Each countdown gets a small triangular wedge in its own colour tag, tucked into the bottom-right corner of the card — and the same wedge in the same spot on the downloadable PNG.

## Behaviour

- Filled triangle in the countdown's colour tag, hugging the inner bottom-right corner of the card panel, roughly 28px on the card and the equivalent size on the 1080px image.
- Sits inside the ink border, does not overlap text or the progress strip, and never intercepts clicks.
- Lapsed countdowns use the same corner mark in cream so it stays visible on the mauve-to-red panel.
- Purely decorative: hidden from screen readers.

## Technical notes

- `src/components/CountdownCard.tsx`: absolutely positioned `div` at the panel's bottom-right using a CSS `clip-path` triangle, filled with `countdown.colorTag` (cream when lapsed), `pointer-events-none`, `aria-hidden`. Reuses the existing `tagColor`/`lapsed` values already computed there.
- `src/lib/shareImage.ts`: after the panel is drawn, fill a matching triangle path at the panel's inner bottom-right corner using the same colour source (`tagColor`, cream when lapsed), scaled to the 1080 canvas.
- No data, storage, or countdown logic changes.
