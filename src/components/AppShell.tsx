import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { Sparkle } from "./Sparkle";
import { PALETTE } from "@/lib/palette";
import { NewCountdownModal } from "./NewCountdownModal";

export function AppShell({ children }: { children: (openNew: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader />


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
        className="brut brut-press fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-none bg-primary px-5 py-4 text-base font-bold text-primary-foreground uppercase sm:right-8 sm:bottom-8"
      >
        <Plus className="h-5 w-5" strokeWidth={3.5} /> New countdown
      </button>

      {open && <NewCountdownModal onClose={() => setOpen(false)} onCreated={() => {}} />}
    </div>
  );
}
