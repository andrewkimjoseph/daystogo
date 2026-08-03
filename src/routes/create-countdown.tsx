import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CreateCountdownForm } from "@/components/CreateCountdownForm";

export const Route = createFileRoute("/create-countdown")({
  head: () => ({
    meta: [
      { title: "New Countdown — Days To Go" },
      {
        name: "description",
        content:
          "Set up a countdown: pick a duration or an exact end time in your local timezone, name it, tag it, and start the clock.",
      },
      { property: "og:title", content: "New Countdown — Days To Go" },
      {
        property: "og:description",
        content:
          "Pick a duration or an exact end time, name it, tag it, and watch it tick down to the second.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateCountdownPage,
});

function CreateCountdownPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">New countdown</h1>
        <p className="mt-2 mb-6 max-w-xl font-bold text-muted-foreground">
          Count a stretch of time, or count to an exact moment. Either way it starts the second you
          hit go.
        </p>

        <CreateCountdownForm />

        <Link
          to="/"
          className="brut brut-press mt-8 inline-flex items-center gap-2 rounded-none bg-cream px-4 py-3 text-sm font-bold text-ink uppercase"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Back to the timers
        </Link>
      </main>
    </div>
  );
}
