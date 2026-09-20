# Left-align the countdown readout again

The countdown readout goes back to starting from the left edge, in both the live card and the downloaded PNG — dropping the centered alignment.

## What changes

- `CountdownCard.tsx`: remove the full-width centered alignment from the timer line so it starts at the card's left edge, keeping the fixed `text-xl sm:text-2xl` size, single spaces between units, one-line layout, and urgent/lapsed colors.
- `shareImage.ts`: restore left-aligned canvas text (from the panel's left edge instead of centered at `left + contentW / 2`), keeping the 64px fixed timer size, one-line fit, CRTD/DNLD stamps, color wedge, and all other export behavior.

No changes to formatting logic, recurrence, data, or persistence.
