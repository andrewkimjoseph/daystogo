# Days To Go

Days To Go — Build Spec

Build a playful, brutalist-styled countdown timer web app called Days To Go (internal name: daystogo). Users can create multiple simultaneous countdowns ranging from 3 seconds up to 365 days, watch them tick down with a cartoony, high-energy UI, and get a confetti + sound celebration when a countdown hits zero.

1. Visual Style — "Playful Brutalism"

The aesthetic is brutalist structure (thick borders, hard drop-shadows, no soft gradients on UI chrome, visible grid, blocky typography) combined with a playful/cartoony energy (bouncy interactions, bold color blocking, sticker-style accents like the reference logo).

Color palette (use exactly these, no invented tints):

Hex Role #EFEADD Base background (warm off-white/cream) #2E9EAC Primary accent (teal) — buttons, active states, "GO" energy #A24962 Secondary accent (mauve/berry) — mid-tone details, gradients #CD2744 Alert/urgency accent (red) — expiring soon, danger states, sparkle accents #426A85 Deep accent (slate blue) — text on light backgrounds, secondary UI, shadows

Brutalist UI rules:

Thick (3–4px) solid black or #426A85 borders on cards, buttons, inputs, and modals.

Hard offset drop-shadows (e.g. 4px 4px 0px #000 or #426A85), NOT soft blurred shadows. Shadow shifts on hover/press to simulate a "pressed button" (shadow shrinks, element nudges toward the shadow).

No border-radius on structural containers (cards, panels) — sharp corners. Buttons and badges/pills CAN be fully rounded for the playful/sticker contrast (mirroring the rounded sparkle + blocky lettering contrast in the logo).

Bold, chunky display typography for countdown numbers — a heavy grotesk or a fun rounded display font (e.g. something like Archivo Black / Space Grotesk / Fredoka for headers) with a slight color gradient treatment on hero text (red → teal, like the logo) reserved for the app title/hero only, not body text.

Flat color blocks instead of gradients for buttons/cards; gradients are reserved as a rare accent (hero title, "lapsed" celebration state).

Grain/noise texture is optional flavor (matches the reference sticker) — subtle, not required for MVP.

Sticker/badge elements (like the sparkle bursts in the logo) can appear as decorative SVG accents near the hero and near celebration states — teal 4-point star, red 4-point star.

Motion should feel bouncy: use spring/ease-out-back easing for card entrances, number tick transitions, and button presses. Avoid slick/linear corporate motion.

Logo / Branding:

A finished logo asset (logo.svg) will be provided — the "DAYS TO GO!" sticker wordmark shown in the reference image (red-to-teal gradient lettering, cream outline, teal + red sparkle accents).

Use logo.svg as the favicon (generate the standard favicon set — favicon.ico, plus apple-touch-icon/PNG fallbacks at the usual sizes — from this SVG rather than a generic placeholder icon).

Use logo.svg directly in the AppShell header as the primary wordmark/brand mark (replace any placeholder text logo). It should sit at a sensible size in the header, left-aligned, with the mute toggle and any other header controls positioned relative to it.

The logo can also anchor the empty state and/or the "New Countdown" success/celebration moments as a recurring brand touch, but the header + favicon placements are the required ones — treat everything else as optional flavor.

Since the logo is provided as a finished asset, do not attempt to recreate or restyle the wordmark with CSS gradients elsewhere — reserve the hero-title gradient treatment described above for cases where the logo itself isn't present (e.g. page <title>/meta text has no visual gradient, obviously, but any large in-app text lockups should default to using logo.svg itself rather than a re-typeset imitation).

Layout:

Home screen = a grid of "countdown cards," each a bordered brutalist tile showing: title, live ticking value (days/hours/min/sec depending on duration), a compact progress bar (blocky, segmented look — not smooth gradient), and status badge (Running / Paused / Lapsed).

Floating or fixed "+ New Countdown" button, teal, thick border, hard shadow, in a corner — big and obvious, playful bounce on hover.

Empty state should be fun and encouraging (illustration/sticker + friendly copy), not a bare "no data" message.

2. Core Functionality

2.1 Creating a countdown

A modal or slide-in panel (brutalist bordered panel, not a soft rounded modal) with:

Title (text input, required, e.g. "Ship the launch")

Duration type — segmented control / tab picker with 4 options: Seconds, Minutes, Hours, Days

Duration value — numeric input, constrained per type:

Seconds: min 3, max 86400 (i.e. don't let seconds exceed a day's worth — reasonable cap, but the hard product rule is overall countdown length must be between 3 seconds and 365 days)

Minutes: min 1, max 525600 (365 days in minutes) but again bounded by overall 365-day cap

Hours: min 1, max 8760 (365 days in hours)

Days: min 1, max 365

Validate on the combined resulting duration in seconds: 3 ≤ duration_seconds ≤ 31,536,000 (365 days). Show a friendly inline error if outside bounds (e.g. "Whoa, that's too far out — keep it under 365 days!" / "Give it at least 3 seconds!").

Optional color tag — let the user pick one of the 5 palette colors to visually tag/organize this countdown card (defaults to teal).

Start button — primary teal brutalist button. On confirm:

Compute and store an absolute endsAt timestamp (start time + duration), not just a remaining-seconds counter, so it survives refresh/close accurately.

Play the countdown-start sound.

Card animates into the grid with a bouncy entrance.

2.2 Running countdowns

Each card ticks live (update at least once per second when in "seconds/minutes" granularity view; can throttle to once per minute for far-future day-scale countdowns to save cycles, but should smoothly switch to per-second updates once the countdown enters its final 60 seconds).

Display format adapts to remaining time: e.g. 142d 04h for long countdowns, 04:12:33 (hh:mm:ss) as it gets closer, and a big chunky 00:00:07 style display in the final minute for drama.

Cards support pause/resume and delete (with a confirmation, brutalist-style — e.g. a blocky "Are you sure?" inline confirm rather than a native browser confirm).

Multiple countdowns run independently and concurrently; the app must handle many active countdowns without jank (drive all card updates from a single shared interval/tick source, not one setInterval per card).

Persist everything (see Data Layer) so countdowns survive page reloads and browser restarts, recalculating "time remaining" from the stored absolute end timestamp on load.

2.3 Lapsing (countdown reaches zero)

When a countdown's endsAt is reached:

Card visually transitions to a "Lapsed 🎉" celebration state (color shifts to the red/mauve accent range, badge changes to "Lapsed").

Trigger a confetti burst animation (screen-level or card-level burst using the palette colors: teal, mauve, red, slate blue confetti pieces).

Play the countdown-lapsed sound.

If the app is not currently open/focused when a countdown lapses, detect this on next load (compare stored endsAt vs current time) and still show the lapsed state + play a one-time celebration animation on load, but don't spam sound/confetti repeatedly on every future visit — only trigger the celebration once per lapse event (track an hasCelebrated boolean per countdown).

Lapsed countdowns remain visible (marked Lapsed) until the user deletes them or optionally "restarts" them (restart = re-open the create flow prefilled with the same title/duration, or a one-click "Run again" that recomputes a new endsAt).

2.4 Sound

Two sound effects: countdown-start.mp3/.ogg and countdown-lapsed.mp3/.ogg.

Ship with lightweight placeholder sounds (simple, royalty-free/generated blips — a short upward chirp for start, a short celebratory jingle/chime for lapse) stored in /public/sounds/, structured so the user can drop in their own final .mp3/.ogg files at the same filenames later without touching code.

Respect browser autoplay policies: sounds should only fire as a result of a user gesture (creating/starting a countdown) or from an already-open, interacted-with tab (lapse sound) — no attempt to autoplay on page load.

Include a small mute/unmute toggle in the app header (persisted to local storage) so sound is fully user-controllable.

2.5 Confetti

Use a lightweight, dependency-friendly confetti approach (canvas-based burst) themed to the 5-color palette.

Trigger location: burst from the center/top of the specific card that lapsed (or full-screen if that reads better in testing) — prioritize a fun, satisfying payoff over subtlety.

3. Data Layer — Local-first with Dexie (IndexedDB)

Hard requirement: no Lovable Cloud, no Supabase, no remote backend of any kind. All persistence is local via Dexie.js wrapping IndexedDB. This is intentional groundwork for a future migration to Postgres via Prisma, so the schema should be designed cleanly and portably (plain, flat, relational-friendly shape — avoid deeply nested objects or Dexie-specific quirks that won't translate to a SQL table).

Suggested schema (countdowns table):

interface Countdown {
  id: string;            // uuid, primary key
  title: string;
  durationType: 'seconds' | 'minutes' | 'hours' | 'days';
  durationValue: number;      // the raw value the user entered, for display/edit purposes
  durationSeconds: number;    // normalized total duration in seconds (source of truth for calculations)
  startedAt: number;          // epoch ms
  endsAt: number;             // epoch ms, startedAt + durationSeconds*1000
  status: 'running' | 'paused' | 'lapsed';
  pausedRemainingMs?: number; // remaining ms snapshot, only set when status === 'paused'
  colorTag: string;           // one of the 5 hex values, for card theming
  hasCelebrated: boolean;     // whether the lapse celebration has already fired
  createdAt: number;          // epoch ms
  updatedAt: number;          // epoch ms
}


Set up a Dexie database (e.g. db.ts) with a versioned schema (db.version(1).stores({ countdowns: 'id, status, endsAt, createdAt' })) so future migrations are straightforward.

All CRUD (create, pause/resume, delete, mark-lapsed, mark-celebrated) goes through a small data-access module (e.g. countdownsRepo.ts) rather than scattering Dexie calls through components — this keeps the future Prisma/Postgres swap to a single file's worth of changes.

On app load, read all countdowns, recompute live status by comparing endsAt to Date.now() (don't trust a possibly-stale status field alone), and update anything that should now be lapsed.

Pause/resume math: on pause, store remaining ms and freeze; on resume, recompute a fresh endsAt = Date.now() + pausedRemainingMs.

4. Tech Notes / Non-Negotiables

No Lovable Supabase/Cloud integration — reject any suggestion to wire up Lovable's built-in backend. This is a local-only IndexedDB app via Dexie.

Keep the data layer decoupled from UI components so it's easy to later swap Dexie calls for API calls to a Prisma/Postgres backend without touching the component tree.

Single shared ticking mechanism (one interval driving all card recalculations) instead of per-card timers.

Sounds and confetti should be easy to theme/replace (palette-driven confetti colors, filename-based sound placeholders).

Fully responsive: card grid should reflow gracefully from a multi-column desktop layout to a single-column mobile layout, keeping the brutalist borders/shadows intact at small sizes.

A logo.svg asset will be provided for the app — wire it in as both the favicon and the in-app header wordmark per Section 1's Logo/Branding notes.

5. Suggested Page/Component Structure

AppShell — header (app title/logo treatment matching the "Days To Go" sticker style, mute toggle), main content area, "+ New Countdown" floating action button.

CountdownGrid — renders CountdownCard for each stored countdown, empty state when none exist.

CountdownCard — live-ticking display, progress indicator, status badge, pause/resume + delete controls, lapsed celebration state.

NewCountdownModal — form described in 2.1, with validation.

ConfettiBurst — reusable trigger-able confetti component.

useCountdownTick (hook) — shared ticking source consumed by cards.

soundManager (util) — plays start/lapse sounds respecting mute state.

db.ts / countdownsRepo.ts — Dexie setup and data access, per Section 3.

6. Tone of Copy

Keep all in-app copy short, punchy, and a little cheeky — matching the sticker energy of the logo. Examples:

Empty state: "No countdowns yet. What are you waiting for?"

Validation error (too long): "Whoa there — max is 365 days."

Validation error (too short): "Give it at least 3 seconds to be a real countdown."

Lapsed badge: "🎉 Lapsed!"

Delete confirm: "Nuke this countdown?"

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://daystogo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0fcfa613-c575-42fc-956a-32bf60abf04b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
