# New domain + earliest-first card sort

## 1. Update the canonical domain to `app.daystogo.xyz`

Replace every `https://www.daystogo.xyz` reference with `https://app.daystogo.xyz` across these files:

- `public/robots.txt` — sitemap line
- `src/routes/sitemap[.]xml.ts` — `BASE_URL` constant
- `src/routes/index.tsx` — og:url + canonical
- `src/routes/about.tsx` — og:url + canonical
- `src/routes/calendar.tsx` — og:url + canonical
- `src/routes/create-countdown.tsx` — og:url + canonical
- `src/routes/__root.tsx` — JSON-LD `url` field

No trailing-slash or path changes — just the host.

## 2. Sort countdown cards earliest-to-achieve first

In `src/lib/countdownsRepo.ts`, change `all()`:

- Before: `getDb().countdowns.orderBy("createdAt").reverse().toArray()` (newest-created first)
- After: `getDb().countdowns.orderBy("endsAt").toArray()` (soonest-ending first)

`endsAt` is already an indexed field (`"id, status, endsAt, createdAt, targetAt, category"`), so the query stays indexed. Lapsed countdowns have the earliest `endsAt` and will bubble to the top of the list; running ones follow in order of how soon they finish. This matches "earliest to achieve."

No schema, repo, or business-logic changes beyond the sort order.
