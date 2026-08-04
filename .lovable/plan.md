# Stop `/create-countdown` reloading forever on app.daystogo.xyz

## What I found

`app.daystogo.xyz` is not served by Lovable. Checking both URLs directly:

```text
https://app.daystogo.xyz/create-countdown      -> 200, server: Vercel
https://daystogo.lovable.app/create-countdown  -> 200, server: cloudflare (Lovable)
```

They are also two different builds. The Vercel copy still loads
`/assets/logo-DvP4eOF6.png`; the Lovable copy loads `logo-BR-yfitV.svg`,
which is the current code (the logo moved to `src/assets/logo.svg` in an
earlier change). Lovable's own domain list for this project contains only
`daystogo.lovable.app` — no custom domain is connected.

So the page you keep reloading is an old snapshot hosted elsewhere. Every
fix I ship here lands on the Lovable deployment and never reaches it. That
is why the same "recursive loading" keeps coming back on route after route
(`/about`, `/calendar`, now `/create-countdown`) even after each fix — the
fixes were real, but they were never being served to you.

A 10-second headless browser run against both URLs today showed no reload
loop and no console errors, which is consistent with a hosting/caching
problem at the Vercel layer rather than a bug in the current code.

## The permanent solution

Point `app.daystogo.xyz` at Lovable so there is exactly one deployment of
this app. Two hosts serving the same hostname from different builds cannot
be fixed from the codebase.

Steps you need to take (I cannot do these from here):

1. In the Vercel dashboard, remove `app.daystogo.xyz` from that project (or
   delete the project). While Vercel still claims the hostname, DNS changes
   can flip-flop between the two origins.
2. In Lovable: Project Settings -> Domains -> Connect Domain, enter
   `app.daystogo.xyz`, and follow the records it shows (A record to
   `185.158.133.1` plus the `_lovable` TXT record). If the DNS is proxied
   through Cloudflare, tick "Domain uses Cloudflare or a similar proxy" so
   it uses CNAME verification instead.
3. Delete any leftover A/CNAME record for `app` that still points at Vercel
   — a stale record alongside the new one is the usual cause of a domain
   that half-works.
4. Publish once the domain shows Active.

## Code-side hardening I will do

Independent of the hosting fix, so a stale or aggressive cache can never
produce a loop again:

- Confirm `/create-countdown` renders identical markup on server and client
  by removing the remaining clock-dependent state seeding from a layout
  effect in `CreateCountdownForm.tsx`, and rendering all local-time text
  (target preview, duration blurb) only behind the existing `useHydrated`
  gate. No time-derived value will be part of the SSR HTML.
- Do the same audit on `/about` and `/calendar` so all three routes follow
  one rule rather than three one-off patches.
- Add a Playwright check under `/tmp` that loads each route, counts main-frame
  navigations over 10s, and fails if a route navigates more than once — used
  to verify before I report back.

## Technical notes

- Root cause of the loop is not reproducible in the current build; nothing in
  `src/` calls `location.reload()` or navigates on mount, and the only
  `router.invalidate()` is behind the error boundary's "Try again" button.
- `og:url` and canonical tags already point at `https://app.daystogo.xyz`, so
  no metadata changes are needed once the domain moves to Lovable.
- If the loop persists on `daystogo.lovable.app` after the domain move, that
  is a genuine code bug and I will chase it with server logs from the Lovable
  deployment, which I can actually read.
