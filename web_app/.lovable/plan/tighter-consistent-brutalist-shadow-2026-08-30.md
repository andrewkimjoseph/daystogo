# Tighter, consistent brutalist shadow

Right now each surface picks its own offset (6px cards, 4px chips/toasts, 9–10px hover lift), so the drop shadows look oversized and uneven. Replace them with one small shared scale.

## Shadow scale (in `src/styles.css`)

Add tokens and use them everywhere:

- `--shadow-brut: 3px 3px 0 0 var(--color-ink)` — default for cards, panels, buttons, inputs, toasts
- `--shadow-brut-sm: 2px 2px 0 0 var(--color-ink)` — small chips and icon buttons
- `--shadow-brut-hover: 4px 4px 0 0 var(--color-ink)` — the lifted/hover state
- `--shadow-brut-none: 0 0 0 0 var(--color-ink)` — pressed state
- Slate variant mirrors the same offsets with `var(--color-slate)`

## Where it applies

- `brut`, `brut-thin`, `brut-slate` utilities → default shadow (slate uses slate token)
- `brut-press` → hover 2px offset shadow, active flat; translate distances reduced to match
- `brut-pop` → hover uses the 4px hover shadow, active drops to small
- `brut-lift` → hover uses the 4px hover shadow instead of 9/10px, and the translate is reduced to `-1px, -2px`
- Sonner toast overrides (toast body and its buttons) → same tokens instead of the current hardcoded 4px/2px
- Inset ring styles used for selected color swatches, calendar days, and picker cells stay unchanged (they are rings, not drop shadows)

Border widths stay as they are; only the drop-shadow depth and matching hover/press translate distances change, so nothing shifts layout.
