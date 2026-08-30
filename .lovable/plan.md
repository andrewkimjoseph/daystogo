# Terms of Service & Privacy Policy for Days To Go

Create two app-owned legal pages, `/terms` and `/privacy`, styled to match the existing brutalist design (same page skeleton as `/about`: `SiteHeader`, back-to-timers button, gradient H1 with logo, `brut` panels), plus a minimal site footer so the pages are discoverable from everywhere.

## 1. New routes

### `src/routes/privacy.tsx` — Privacy Policy
Content based on verified facts about how the app works:
- **No account needed:** countdowns live only in the browser's IndexedDB (local storage). Clearing browser data deletes them; it does not touch cloud timers.
- **Signed-in users:** accounts are managed by Clerk; we store the account email/name and the countdown records (title, target/end times, color/category, status, timestamps) in a hosted Postgres database, scoped to the account with row-level security so only the owner can read or modify their rows.
- **No sale of data, no advertising trackers, no analytics claims** beyond what the app does.
- **Data removal:** deleting a countdown removes it; account deletion / data deletion requests via the contact channel.
- **Contact:** link to the GitHub profile (github.com/andrewkimjoseph), same as the About page.
- No compliance certifications, GDPR/CCPA claims, or cookie-consent claims — only factual descriptions.

### `src/routes/terms.tsx` — Terms of Service
Plain-language terms for a personal app by an individual (Andrew Kim Joseph):
- What the service is (free countdown timer web app).
- Acceptable use; content you create (countdown titles) is yours and stays in your account/browser.
- Service provided "as is" and "as available", no warranties; no liability for lost timers or data.
- Terms may change; continued use = acceptance.
- Governed contact via the GitHub channel (no fabricated legal entity or jurisdiction claims).

### Shared details
- Each route gets its own `head()` with unique title/description, `og:title`, `og:description`, `og:type`, canonical `https://app.daystogo.xyz/privacy` (and `/terms`), matching the pattern in `about.tsx`.
- Use text sizes/panels consistent with `/about`; long text stays readable (`max-w-6xl` container, `brut bg-card` panel, `leading-relaxed`).
- Update the sitemap (`src/routes/sitemap[.]xml.ts`) to include `/privacy` and `/terms`.

## 2. Site footer for discoverability
Add a small, silent footer component (e.g. `src/components/SiteFooter.tsx`) rendered once in `src/routes/__root.tsx` below `<Outlet />`:
- Links: Terms · Privacy · About (desktop text + mobile-friendly, small muted type).
- Keeps existing pages unchanged otherwise.

## 3. Verification
- `npm run build` passes.
- Playwright check: `/privacy` and `/terms` render with correct H1s, header/footer links navigate correctly, and the sitemap lists both URLs.
