import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CreateCountdownForm } from "@/components/CreateCountdownForm";

export const Route = createFileRoute("/create-countdown")({
  validateSearch: (search: Record<string, unknown>): { date?: string } =>
    typeof search["date"] === "string" ? { date: search["date"] as string } : {},
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
      { property: "og:url", content: "https://app.daystogo.xyz/create-countdown" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://app.daystogo.xyz/create-countdown" }],
  }),

  component: CreateCountdownPage,
});

function CreateCountdownPage() {
  const { date } = Route.useSearch();
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

        <CreateCountdownForm initialDate={date ?? ""} />
      </main>

    </div>
  );
}
