import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "./SiteHeader";
import { Sparkle } from "./Sparkle";
import { TodayClock } from "./TodayClock";
import { AuthGate } from "./AuthGate";

import { PALETTE } from "@/lib/palette";

export function AppShell({
  children,
  title = "Put a clock on it.",
  subtitle = "Three seconds to forever (well — forever isn’t a thing, but we’ll get close). Everything ticks at once.",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="view-page mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="relative mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <Sparkle color={PALETTE.red} size={26} className="absolute -top-4 left-0 hidden sm:block" />
            <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-xl font-bold text-muted-foreground">{subtitle}</p>
          </div>
          <TodayClock />
        </div>

        <AuthGate>{children}</AuthGate>
        <div className="h-20 sm:h-24" aria-hidden="true" />
      </main>


      <Link
        to="/create-countdown"
        className="brut brut-press fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-none bg-primary px-4 py-3 text-sm font-bold text-primary-foreground uppercase sm:right-8 sm:bottom-8 sm:px-5 sm:py-4 sm:text-base"
      >
        <Plus className="h-5 w-5 shrink-0" strokeWidth={3} /> New countdown
      </Link>
    </div>
  );
}
