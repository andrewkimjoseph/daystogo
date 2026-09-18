import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Banknote,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  Cloud,
  Github,
  Linkedin,
  Mail,
  PartyPopper,
  Repeat,
  Tag,
  Timer,
} from "lucide-react";
import { SiteHeader } from "#/components/SiteHeader";
import { Sparkle } from "#/components/Sparkle";
import { TodayClock } from "#/components/TodayClock";
import { DemoCountdownCard, type DemoCountdown } from "#/components/DemoCountdownCard";
import { useCountdownTick } from "#/hooks/useCountdownTick";
import { useHydrated } from "#/hooks/useHydrated";
import { COLOR_TAGS, PALETTE } from "#/lib/palette";
import { APP_URL, GITHUB_URL, SITE_URL, socialLinks } from "#/lib/urls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Days To Go — Playful Countdown Timers" },
      {
        name: "description",
        content:
          "Run as many countdowns as you like, from 3 seconds to years out, ticking down to the second, with confetti and a chime when the clock hits zero.",
      },
      { property: "og:title", content: "Days To Go — Playful Countdown Timers" },
      {
        property: "og:description",
        content:
          "Run as many countdowns as you like, from 3 seconds to years out, ticking down to the second, with confetti when the clock hits zero.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: Home,
});

function nextNewYear(now: number): number {
  const d = new Date(now);
  let year = d.getFullYear() + 1;
  const candidate = new Date(year, 0, 1, 0, 0, 0, 0).getTime();
  if (candidate <= now) year += 1;
  return new Date(year, 0, 1, 0, 0, 0, 0).getTime();
}

function makeSamples(now: number): DemoCountdown[] {
  const payday = now + 5 * 86400000 + 3 * 3600000;
  const launch = now + 2 * 86400000 + 11 * 3600000 + 27 * 60000;
  const nye = nextNewYear(now);
  return [
    {
      id: "payday",
      title: "PAYDAY",
      category: "Financial",
      CategoryIcon: Banknote,
      colorTag: PALETTE.mauve,
      recurrence: "MONTHLY",
      startedAt: now - 20 * 86400000,
      endsAt: payday,
    },
    {
      id: "launch",
      title: "LAUNCH DAY",
      category: "Work & Career",
      CategoryIcon: BriefcaseBusiness,
      colorTag: PALETTE.red,
      startedAt: now - 12 * 86400000,
      endsAt: launch,
    },
    {
      id: "nye",
      title: "NEW YEAR",
      category: "Events",
      CategoryIcon: PartyPopper,
      colorTag: PALETTE.teal,
      recurrence: "YEARLY",
      startedAt: new Date(new Date(now).getFullYear(), 0, 1).getTime(),
      endsAt: nye,
    },
  ];
}

const FEATURES = [
  {
    icon: Timer,
    title: "Live to the second",
    body: "Every card shares one clock. Nothing is rounded away.",
  },
  {
    icon: CalendarDays,
    title: "Any target date",
    body: "Three seconds from now, or a date years out. You pick the landing.",
  },
  {
    icon: Repeat,
    title: "It can repeat",
    body: "Daily, weekly, monthly, or yearly — it celebrates, then steps forward.",
  },
  {
    icon: Tag,
    title: "Categories & colour",
    body: "Tag Financial, Health, Work, and more. Filter the board your way.",
  },
  {
    icon: Calendar,
    title: "Calendar view",
    body: "Flip months. Marked days open a panel of live remaining times.",
  },
  {
    icon: Cloud,
    title: "Local first, optional sync",
    body: "No account needed. Sign in when you want the same board everywhere.",
  },
  {
    icon: PartyPopper,
    title: "Confetti at zero",
    body: "A burst and a chime when the timer lapses. Mute the sound if you like.",
  },
];

function Home() {
  const hydrated = useHydrated();
  const now = useCountdownTick();
  const [samples] = useState(() => makeSamples(Date.now()));

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="view-page mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="relative mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <Sparkle color={PALETTE.red} size={26} className="absolute -top-4 left-0 hidden sm:block" />
            <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">Put a clock on it.</h1>
            <p className="mt-2 max-w-xl font-bold text-muted-foreground">
              Three seconds to forever (well — forever isn’t a thing, but we’ll get close). Everything ticks
              at once.
            </p>
            <div className="mt-6 flex flex-nowrap gap-3">
              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="brut brut-press inline-flex shrink-0 items-center gap-2 rounded-none bg-primary px-3 py-3 text-sm font-bold text-primary-foreground uppercase sm:px-5 sm:text-base"
              >
                Open the app
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="brut brut-press inline-flex shrink-0 items-center gap-2 rounded-none bg-cream px-3 py-3 text-sm font-bold text-ink uppercase sm:px-5 sm:text-base"
              >
                <Github className="h-4 w-4" strokeWidth={3} />
                GitHub
              </a>
            </div>
          </div>
          <TodayClock />
        </div>

        <section aria-label="Sample countdowns" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hydrated
            ? samples.map((countdown) => (
                <DemoCountdownCard key={countdown.id} countdown={countdown} now={now} />
              ))
            : [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="brut flex h-[280px] items-center justify-center bg-card"
                  role="status"
                  aria-label="Loading"
                >
                  <img src="/loader.svg" alt="" className="h-16 w-16" aria-hidden="true" />
                </div>
              ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl uppercase sm:text-3xl">What you get</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="brut bg-card p-4">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={3} />
                  <h3 className="mt-2 text-base uppercase">{feature.title}</h3>
                  <p className="mt-1 text-sm font-bold text-muted-foreground">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl uppercase sm:text-3xl">How it works</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { n: "1", t: "Pick a moment", d: "Name it, colour it, set the landing in your local time." },
              { n: "2", t: "Watch it tick", d: "The whole board updates together, down to the second." },
              { n: "3", t: "Celebrate zero", d: "Confetti. Optional chime. Repeat, archive, or bin it." },
            ].map((step) => (
              <li key={step.n} className="brut bg-cream p-4">
                <p className="tick-numerals text-3xl text-primary">{step.n}</p>
                <h3 className="mt-1 text-base uppercase">{step.t}</h3>
                <p className="mt-1 text-sm font-bold text-muted-foreground">{step.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl uppercase sm:text-3xl">The look</h2>
          <p className="mt-2 max-w-2xl font-bold text-muted-foreground">
            Playful Brutalism: cream base, thick ink borders, hard offset shadows, sharp corners.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { hex: PALETTE.cream, label: "Cream" },
              ...COLOR_TAGS,
            ].map((swatch) => (
              <div key={swatch.label} className="flex flex-col items-center gap-2">
                <span
                  className="brut-thin h-12 w-12"
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.label}
                />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{swatch.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mt-12 scroll-mt-8">
          <h2 className="text-2xl uppercase sm:text-3xl">Built by</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Days To Go is a project by Andrew Kim Joseph.{" "}
            <Link to="/about" viewTransition className="font-bold uppercase underline hover:text-ink">
              More about
            </Link>
            . Say hi:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={socialLinks.x}
              target="_blank"
              rel="noreferrer"
              aria-label="X / Twitter"
              className="brut brut-press inline-flex h-12 w-12 items-center justify-center rounded-none bg-primary text-primary-foreground"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="brut brut-press inline-flex h-12 w-12 items-center justify-center rounded-none bg-primary text-primary-foreground"
            >
              <Github className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="brut brut-press inline-flex h-12 w-12 items-center justify-center rounded-none bg-primary text-primary-foreground"
            >
              <Linkedin className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href={`mailto:${socialLinks.email}`}
              rel="noreferrer"
              aria-label="Email"
              className="brut brut-press inline-flex h-12 w-12 items-center justify-center rounded-none bg-primary text-primary-foreground"
            >
              <Mail className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
