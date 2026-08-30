import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Days To Go" },
      {
        name: "description",
        content:
          "The plain-language terms for using Days To Go: a free, playful countdown timer provided as is.",
      },
      { property: "og:title", content: "Terms of Service — Days To Go" },
      {
        property: "og:description",
        content:
          "The plain-language terms for using Days To Go: a free, playful countdown timer provided as is.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.daystogo.xyz/terms" },
    ],
    links: [{ rel: "canonical", href: "https://app.daystogo.xyz/terms" }],
  }),

  component: TermsPage,
});

function TermsPage() {
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
          <span className="hero-gradient">Terms</span>
          <img src="/logo.png" alt="Days To Go" className="h-10 w-auto sm:h-14" />
        </h1>

        <p className="mt-4 text-lg font-bold text-muted-foreground">
          The plain-language terms for using Days To Go. Last updated: August 30, 2026.
        </p>

        <div className="brut mt-6 space-y-6 bg-card p-4 text-foreground sm:mt-8 sm:p-6">
          <section>
            <h2 className="text-xl uppercase">The service</h2>
            <p className="mt-2 text-base leading-relaxed">
              Days To Go is a free, playful countdown timer web app. You can run as many
              countdowns as you like — locally in your browser, or synced to an account if
              you sign in. Use it for anything legal; don't use it to break the law, abuse
              the service, or interfere with other people's use of it.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">Your content</h2>
            <p className="mt-2 text-base leading-relaxed">
              The countdowns you create — titles, dates, tags — are yours. Guest timers stay
              in your browser; signed-in timers are stored in your account. You're
              responsible for what you put in them.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">Accounts</h2>
            <p className="mt-2 text-base leading-relaxed">
              An account is optional. If you create one, keep your credentials safe —
              accounts are managed by a third-party authentication provider. You can stop
              using your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">No warranty</h2>
            <p className="mt-2 text-base leading-relaxed">
              Days To Go is provided <span className="font-bold">“as is”</span> and{" "}
              <span className="font-bold">“as available”</span>, without warranties of any
              kind. It may change, break, or be discontinued. Don't rely on it for anything
              critical — if a countdown matters, keep your own backup of the date.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">Limitation of liability</h2>
            <p className="mt-2 text-base leading-relaxed">
              To the maximum extent permitted by law, Days To Go and its author are not
              liable for any lost timers, missed events, lost data, or other damages arising
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">Changes to these terms</h2>
            <p className="mt-2 text-base leading-relaxed">
              These terms may be updated from time to time. The current version lives on
              this page, and continuing to use Days To Go after a change means you accept it.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">Contact</h2>
            <p className="mt-2 text-base leading-relaxed">
              Days To Go is a project by Andrew Kim Joseph. Questions? Say hi on{" "}
              <a
                href="https://github.com/andrewkimjoseph"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
