import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PALETTE } from "@/lib/palette";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Days To Go — Local-First Countdown Timers" },
      {
        name: "description",
        content:
          "What Days To Go is: playful brutalist countdown timers, 3 seconds to years out, running locally in your browser with confetti and a chime at zero.",
      },
      { property: "og:title", content: "About Days To Go — Local-First Countdown Timers" },
      {
        property: "og:description",
        content:
          "Playful brutalist countdown timers, 3 seconds to years out, running locally in your browser.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://daystogo.xyz/about" },
    ],
    links: [{ rel: "canonical", href: "https://daystogo.xyz/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Andrew Kim Joseph",
          url: "https://github.com/andrewkimjoseph",
          sameAs: ["https://github.com/andrewkimjoseph"],
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
        <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">About Days To Go</h1>
        <p className="mt-4 text-lg font-bold text-muted-foreground">
          A playful, brutalist countdown timer that lives right in your browser.
        </p>

        <div className="brut mt-8 bg-card p-6 text-foreground">
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
            and a little chime. Pause, resume, or run it again — it's all yours.
          </p>
          <p className="mt-4 text-base leading-relaxed">
            It's local-first: your timers are saved in your browser, so there's no
            account to make and no server to trust. Open the tab, set a clock, and put
            a clock on it.
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl uppercase">Built by</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Days To Go is a project by Andrew Kim Joseph. Peek at the code, file an
            issue, or say hi:
          </p>
          <a
            href="https://github.com/andrewkimjoseph"
            target="_blank"
            rel="noreferrer"
            className="brut brut-press mt-4 inline-flex items-center gap-3 rounded-none bg-primary px-6 py-4 text-lg font-bold uppercase text-primary-foreground"
          >
            <Github className="h-6 w-6" strokeWidth={2.5} />
            andrewkimjoseph on GitHub
          </a>
        </section>

        <div className="mt-10">
          <Link
            to="/"
            viewTransition
            className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-5 py-3 text-sm font-bold uppercase text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
            Back to the timers
          </Link>
        </div>
      </main>
    </div>
  );
}
