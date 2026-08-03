import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CountdownGrid } from "@/components/CountdownGrid";

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
      { property: "og:url", content: "https://daystogo.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://daystogo.lovable.app/" }],
  }),

  component: Index,
});

function Index() {
  return (
    <AppShell>
      <CountdownGrid />
    </AppShell>
  );
}
