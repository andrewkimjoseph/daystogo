import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo } from "@/lib/countdownsRepo";
import { HourglassLoader } from "./HourglassLoader";

export function LocalImport({ children }: { children: ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<"checking" | "importing" | "error" | "ready">("checking");
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setPhase("checking");
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    let cancelled = false;
    void (async () => {
      try {
        if (!cancelled) setPhase("importing");
        await countdownsRepo.sync();
        await queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
        if (!cancelled) setPhase("ready");
      } catch (error) {
        console.error(error);
        if (!cancelled) setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, queryClient, attempt]);

  if (phase === "importing" || phase === "checking") {
    if (phase === "checking") return <HourglassLoader />;
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-3 bg-card p-6 text-center sm:p-12">
        <h2 className="text-xl uppercase sm:text-2xl">Syncing your countdowns…</h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          Lining up the clocks in this browser with the ones in the cloud.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-4 bg-card p-6 text-center sm:p-12">
        <h2 className="text-xl uppercase sm:text-2xl">Couldn't sync — try again</h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          Your local clocks are still in this browser. The cloud copy didn’t line up, so nothing was
          marked done.
        </p>
        <button
          type="button"
          onClick={retry}
          className="brut-thin brut-press rounded-none bg-primary px-5 py-3 font-bold text-primary-foreground uppercase"
        >
          Try again
        </button>
      </div>
    );
  }

  return children;
}
