import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.svg.asset.json";
import { countdownsRepo } from "@/lib/countdownsRepo";
import { useCountdownTick } from "@/hooks/useCountdownTick";
import { CountdownCard } from "./CountdownCard";

export function CountdownGrid() {
  const now = useCountdownTick();
  const countdowns = useLiveQuery(() => countdownsRepo.all(), [], undefined);

  useEffect(() => {
    void countdownsRepo.reconcile();
  }, []);

  if (!countdowns) return null;

  if (countdowns.length === 0) {
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-5 bg-card p-6 text-center sm:p-12">
        <img src={logoAsset.url} alt="Days To Go" className="w-36 sm:w-48" />
        <h2 className="text-xl uppercase sm:text-2xl">No countdowns yet.</h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          What are you waiting for? Pick something, put a clock on it, watch it sweat.
        </p>
        <Link
          to="/create-countdown"
          className="brut-thin brut-press rounded-none bg-primary px-5 py-3 font-bold text-primary-foreground uppercase"
        >
          Start one now
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {countdowns.map((c) => (
        <CountdownCard key={c.id} countdown={c} now={now} onChanged={() => {}} />
      ))}
    </div>
  );
}
