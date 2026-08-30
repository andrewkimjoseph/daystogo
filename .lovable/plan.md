# Header: single Home button on non-home pages

## Goal
Simplify the site header nav. Nav icons (Archive, Calendar, About) appear only on the home page. On every other page (About, Calendar, Archived, Create countdown, Privacy, Terms), the header shows a single Home button instead of the page-specific icons — the current page's icon is never shown for the page you're on.

## Changes

### `src/components/SiteHeader.tsx` (only file touched)
- Replace the three per-page flags (`onArchived`, `onCalendar`, `onAbout`) with a single `onHome` check: `pathname === "/"` (treat any non-"/" path as a subpage).
- Keep the "New countdown" button exactly as is (hidden on `/create-countdown`).
- **On home (`onHome` true):** render the existing three cream buttons linking to `/archived`, `/calendar`, `/about` — Archive icon + "Archive" text on desktop, icon-only on mobile (current behavior).
- **On any other page:** render one Home button (`bg-cream`, `brut brut-press`, same sizing): `Home` icon on mobile, "Home" text on desktop, linking to `/` with `viewTransition`, `aria-label="Home"`.
- Desktop (`sm:`) keeps text labels; mobile keeps compact icons, so the header gets less crowded on phones.

### No other changes
- No routing, data, or other component changes. `/archived`, `/calendar`, `/about`, `/privacy`, `/terms` and the create page all automatically show the Home button since they are non-home paths.

## Verification
- Typecheck passes.
- Playwright: visit `/` (Archive/Calendar/About icons visible, no Home button), then `/about`, `/calendar`, `/archived` (single Home icon-only button, no page icons), and `/create-countdown` (Home button + no New button). Screenshot the mobile (393px) header on each.
