import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CountdownGrid } from "@/components/CountdownGrid";

const TITLE = "Archived Countdowns — Days To Go";
const DESCRIPTION =
  "Every countdown you've already crossed off, tucked away in one place. Revisit the moment, save it as a PNG, or put it back on the board.";

export const Route = createFileRoute("/archived")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.daystogo.xyz/archived" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://app.daystogo.xyz/archived" }],
  }),

  component: Archived,
});

function Archived() {
  return (
    <AppShell
      title="The done pile."
      subtitle="Clocks that already hit zero. Keep them as souvenirs, save the PNG, or send one back to the board."
    >
      <CountdownGrid variant="archived" />
    </AppShell>
  );
}
