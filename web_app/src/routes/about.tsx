import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Github, Linkedin, Mail, Shield, FileText } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PALETTE } from "@/lib/palette";
import { socialLinks } from "@/lib/socials";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Days To Go — Playful Countdown Timers" },
      {
        name: "description",
        content:
          "What Days To Go is: playful brutalist countdown timers, 3 seconds to years out, with confetti and a chime at zero.",
      },
      { property: "og:title", content: "About Days To Go — Playful Countdown Timers" },
      {
        property: "og:description",
        content:
          "Playful brutalist countdown timers, 3 seconds to years out. Sign in only if you want them in the cloud.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.daystogo.xyz/about" },
    ],
    links: [{ rel: "canonical", href: "https://app.daystogo.xyz/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Andrew Kim Joseph",
          url: socialLinks.x,
          sameAs: [socialLinks.x, socialLinks.github, socialLinks.linkedin],
        }),
      },
    ],
  }),

  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />


      <main className="view-page mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-4 flex justify-end sm:mb-6">
          <Link
            to="/"
            viewTransition
            className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-3 py-2.5 text-xs font-bold uppercase text-ink sm:px-4 sm:py-3 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
            Back to the timers
          </Link>
        </div>

        <h1 className="flex flex-wrap items-center gap-3 text-3xl uppercase sm:gap-4 sm:text-5xl">
          <span className="hero-gradient">About</span>
          <img src="/logo.png" alt="Days To Go" className="h-10 w-auto sm:h-14" />
        </h1>

        <p className="mt-4 text-lg font-bold text-muted-foreground">
          A playful, brutalist countdown timer for the things you're waiting on.
        </p>

        <div className="brut mt-6 bg-card p-4 text-foreground sm:mt-8 sm:p-6">
          <p className="text-base leading-relaxed">
            Days To Go lets you run as many countdowns as you like, from a quick{" "}
            <span className="font-bold">3 seconds</span> all the way out to{" "}
            <span className="font-bold">years from now</span> — there’s no ceiling. Everything
            ticks at once on one shared clock, down to the second, so you can watch time pass.
          </p>
          <p className="mt-4 text-base leading-relaxed">
            When a timer hits zero, it celebrates with a burst of{" "}
            <span className="font-bold" style={{ color: PALETTE.red }}>
              confetti
            </span>{" "}
            and a little chime. Re-tag it, run it again, or bin it — it's all yours.
          </p>
          <p className="mt-4 text-base leading-relaxed">
            You don't need an account — clocks live in this browser until you want them
            elsewhere. Sign in and the same board follows you from one browser to the next.
            Open the tab, set a countdown, and put a clock on it.
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl uppercase">Built by</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Days To Go is a project by Andrew Kim Joseph. Say hi:
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

        <section className="mt-8">
          <h2 className="text-2xl uppercase">The fine print</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to="/privacy"
              viewTransition
              className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-4 py-3 text-sm font-bold uppercase text-ink"
            >
              <Shield className="h-4 w-4 shrink-0" strokeWidth={3} />
              Privacy
            </Link>
            <Link
              to="/terms"
              viewTransition
              className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-4 py-3 text-sm font-bold uppercase text-ink"
            >
              <FileText className="h-4 w-4 shrink-0" strokeWidth={3} />
              Terms
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
