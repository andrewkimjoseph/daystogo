# Category filter in the address bar

## What changes
- Picking a category filter on the board (home) or the Archived page puts it in the address, e.g. `/?category=travel` or `/archived?category=work`.
- Opening such a link shows only that category's countdowns, with that filter chip highlighted.
- "All" removes the parameter, giving a clean `/`.
- Back/forward buttons step through filter changes.
- An unknown value (e.g. `?category=pizza`) or a category with no countdowns falls back to showing all; the address is left as typed.

## Technical details
- `index.tsx` and `archived.tsx`: add `validateSearch` with an optional string `category` (no closed enum, per search-param rules).
- `CountdownGrid`: replace the `filter` useState with a `category` prop plus `onCategoryChange`; each route reads `Route.useSearch()` and navigates with `search: (prev) => ({ ...prev, category: key === "all" ? undefined : key })`.
- The grid treats the value as active only when it matches a known category that is in use; otherwise "All".
- Install `@tanstack/zod-adapter` if not already present (zod is installed).
- Verify in the preview: click a chip, check the URL; load `/?category=travel` directly; check Back; check an invalid value.
