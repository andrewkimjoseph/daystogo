# Sharp corners on every button

The text blocks use hard 90-degree corners, but most buttons are still pill-shaped or softly rounded. This makes all interactive controls match the sharp-corner standard.

## What changes

- Every button, pill and icon control in the app gets square corners — no pills, no soft rounding.
- Look stays otherwise identical: same thick black outlines, hard offset shadows, same press/hover motion, same colors and sizes.
- Small circular icon buttons (mute toggle, modal close, card delete, stepper +/-) become square boxes of the same size.

## Where

- Header: About pill, mute toggle (home + about pages)
- Floating "New countdown" button
- Countdown cards: status chip, pause/resume, run again, delete, and any action buttons
- New countdown modal: close, duration presets, +/- steppers, submit button
- Empty state: "New countdown" call to action
- About page: GitHub link button, back-to-timers link, header controls

## Technical notes

- Replace `rounded-full` / `rounded-xl` / `rounded-md` with a sharp-corner treatment on the app's brutalist controls in `src/components/AppShell.tsx`, `MuteToggle.tsx`, `CountdownCard.tsx`, `CountdownGrid.tsx`, `NewCountdownModal.tsx`, and `src/routes/about.tsx`.
- Add a single `brut-square` utility (`border-radius: 0`) in `src/styles.css` so the rule is enforced in one place rather than per-element, and apply it alongside the existing `brut` / `brut-thin` / `brut-press` utilities.
- Untouched: shadcn primitives in `src/components/ui/*` (not used by these screens) and the default error/not-found buttons in `__root.tsx` unless you want those too.
