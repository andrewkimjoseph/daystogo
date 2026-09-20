# Center countdown readouts with equal side spacing

The complete countdown string will sit visually centered, leaving equal breathing room on its left and right in both the live card and downloaded PNG.

## What changes

- Center the live countdown readout across the full usable width of each card.
- Center the downloadable countdown readout within the PNG panel’s padded content area instead of anchoring it to the left edge.
- Preserve the current single spaces between units, fixed timer size, one-line layout, week/month/year formatting, colors, and urgent/lapsed styling.
- Check short and longest readouts on mobile and desktop so both sides remain balanced without clipping.

## Build corrections

- Make the root build emit the deployable output where the platform expects it, while keeping development rooted in `web_app`.
- Align the TanStack package versions to remove the current incompatible router export error, then refresh dependencies.
- Verify the app loads without the captured runtime error and that the production output is created successfully.

## Technical details

- `CountdownCard.tsx`: give the timer line full width and centered text alignment.
- `shareImage.ts`: measure the final fitted timer string and calculate its horizontal start from the center of `contentW`, or use centered canvas alignment scoped to that content area.
- Build configuration: emit the deployment artifact at the repository root and keep all existing app behavior unchanged.
- No countdown data, recurrence, persistence, or formatting logic changes.
