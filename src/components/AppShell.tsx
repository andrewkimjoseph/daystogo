import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import logoAsset from "@/assets/logo.svg.asset.json";
import { MuteToggle } from "./MuteToggle";
import { Sparkle } from "./Sparkle";
import { PALETTE } from "@/lib/palette";
import { NewCountdownModal } from "./NewCountdownModal";

export function AppShell({ children }: { children: (openNew: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-ink bg-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <img src={logoAsset.url} alt="Days To Go" className="h-14 w-auto sm:h-16" />
          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="brut brut-press hidden rounded-full bg-cream px-4 py-2 text-sm font-bold uppercase text-ink sm:inline-flex"
            >
              About
            </Link>
            <MuteToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="relative mb-8">
          <Sparkle color={PALETTE.red} size={26} className="absolute -top-4 left-0 hidden sm:block" />
          <h1 className="hero-gradient text-4xl uppercase sm:text-5xl">Put a clock on it.</h1>
          <p className="mt-2 max-w-xl font-bold text-muted-foreground">
            Three seconds to three hundred and sixty-five days. Everything ticks at once.
          </p>
        </div>

        {children(() => setOpen(true))}
      </main>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="brut brut-press fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-4 text-base font-bold text-primary-foreground uppercase sm:right-8 sm:bottom-8"
      >
        <Plus className="h-5 w-5" strokeWidth={3.5} /> New countdown
      </button>

      {open && <NewCountdownModal onClose={() => setOpen(false)} onCreated={() => {}} />}
    </div>
  );
}
