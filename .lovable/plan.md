# Align page content widths

Right now each route uses a different content width, so the About page (and the New Countdown page) sit narrower than the header and the home grid — that's the extra space on the sides.

- Header inner container: `max-w-6xl`
- Home: `max-w-6xl`
- New Countdown: `max-w-5xl`
- About: `max-w-3xl`

## What changes

Every route uses the same outer container as the header — `max-w-6xl` with `px-4 sm:px-6` and `py-8 sm:py-10` — so headings, the first card, and the footer buttons line up vertically across Home, New Countdown, and About.

About keeps comfortable reading measure by capping the prose block itself (not the page) at roughly `max-w-3xl`, so the title, text card, "Built by" section, and buttons all start at the same left edge as the logo in the header.

## Technical notes

- `src/routes/about.tsx`: change `main` to `mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10`; wrap the existing content in an inner `max-w-3xl` div so line length stays readable.
- `src/routes/create-countdown.tsx`: change `max-w-5xl` to `max-w-6xl` and `py-8 sm:py-10` to match.
- `src/components/AppShell.tsx`: unchanged (already the target width).
- No layout logic or component structure changes beyond these container classes.
