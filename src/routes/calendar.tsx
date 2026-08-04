import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CountdownCalendar } from "@/components/CountdownCalendar";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Days To Go" },
      {
        name: "description",
        content:
          "Browse months and years in a playful brutalist calendar, with every day your countdowns land on clearly marked.",
      },
      { property: "og:title", content: "Calendar — Days To Go" },
      {
        property: "og:description",
        content:
          "Flip through months and years and see exactly which days your countdowns land on.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.daystogo.xyz/calendar" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.daystogo.xyz/calendar" }],
  }),

  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="view-page mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-4 flex justify-end sm:mb-6">
          <Link
            to="/"
            viewTransition
            className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-3 py-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:py-3 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Back to the timers
          </Link>
        </div>

        <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">Calendar</h1>
        <p className="mt-2 mb-6 max-w-xl font-bold text-muted-foreground">
          Wander through the months. Marked days are the ones with a clock already ticking toward
          them.
        </p>

        <CountdownCalendar />
      </main>
    </div>
  );
}
