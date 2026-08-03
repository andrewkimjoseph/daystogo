import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "./SiteHeader";
import { Sparkle } from "./Sparkle";
import { PALETTE } from "@/lib/palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="view-page mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-10">
        <div className="relative mb-8">
          <Sparkle color={PALETTE.red} size={26} className="absolute -top-4 left-0 hidden sm:block" />
          <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">Put a clock on it.</h1>
          <p className="mt-2 max-w-xl font-bold text-muted-foreground">
            Three seconds to forever (well — forever isn’t a thing, but we’ll get close). Everything ticks at once.
          </p>
        </div>

        {children}
      </main>

      <Link
        to="/create-countdown"
        viewTransition
        className="brut brut-press fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-none bg-primary px-4 py-3 text-sm font-bold text-primary-foreground uppercase sm:right-8 sm:bottom-8 sm:px-5 sm:py-4 sm:text-base"
      >
        <Plus className="h-5 w-5 shrink-0" strokeWidth={3.5} /> New countdown
      </Link>
    </div>
  );
}
