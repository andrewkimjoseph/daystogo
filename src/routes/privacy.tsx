import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Days To Go" },
      {
        name: "description",
        content:
          "How Days To Go handles your data: countdowns stay in your browser, and signed-in timers sync only to your own account.",
      },
      { property: "og:title", content: "Privacy Policy — Days To Go" },
      {
        property: "og:description",
        content:
          "How Days To Go handles your data: countdowns stay in your browser, and signed-in timers sync only to your own account.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.daystogo.xyz/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://app.daystogo.xyz/privacy" }],
  }),

  component: PrivacyPage,
});

function PrivacyPage() {
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
          <span className="hero-gradient">Privacy</span>
          <img src={logoUrl} alt="Days To Go" className="h-10 w-auto sm:h-14" />
        </h1>

        <p className="mt-4 text-lg font-bold text-muted-foreground">
          Short version: your countdowns are yours. Guests stay on your device, and
          signed-in timers sync only to your own account.
        </p>

        <div className="brut mt-6 space-y-6 bg-card p-4 text-foreground sm:mt-8 sm:p-6">
          <section>
            <h2 className="text-xl uppercase">What we store</h2>
            <p className="mt-2 text-base leading-relaxed">
              <span className="font-bold">Without an account</span>, your countdowns live
              only in this browser (in your browser's local storage). They never leave your
              device. Clearing your browser data deletes them — and it does not delete cloud
              timers saved under an account.
            </p>
            <p className="mt-4 text-base leading-relaxed">
              <span className="font-bold">With an account</span>, we store your account
              email and name, plus the countdowns you sync: titles, target and end times,
              colors, categories, status, and timestamps. Accounts are managed by Clerk, and
              synced timers are stored in a hosted Postgres database scoped to your account
              with row-level security — only you can read or change your rows.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">What we don't do</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
              <li>We don't sell your data.</li>
              <li>We don't run advertising or ad trackers.</li>
              <li>We don't read the contents of your countdowns beyond what the app needs to run them for you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase">Deleting your data</h2>
            <p className="mt-2 text-base leading-relaxed">
              Deleting a countdown in the app removes it from your board and, if you're
              signed in, from your synced account. If you'd like your whole account and its
              synced timers removed, reach out and we'll take care of it.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase">Contact</h2>
            <p className="mt-2 text-base leading-relaxed">
              Questions about any of this? Say hi on{" "}
              <a
                href="https://github.com/andrewkimjoseph"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline"
              >
                GitHub
              </a>{" "}
              — Days To Go is a project by Andrew Kim Joseph.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
