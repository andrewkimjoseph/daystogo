import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { getDb } from "@/lib/db";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo } from "@/lib/countdownsRepo";

function migratedKey(userId: string) {
  return `daystogo:migrated:${userId}`;
}

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
    if (localStorage.getItem(migratedKey(userId))) {
      setPhase("ready");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const rows = await getDb().countdowns.toArray();
        if (rows.length === 0) {
          localStorage.setItem(migratedKey(userId), "1");
          if (!cancelled) setPhase("ready");
          return;
        }
        if (!cancelled) setPhase("importing");
        await countdownsRepo.importLocal(rows);
        localStorage.setItem(migratedKey(userId), "1");
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
    if (phase === "checking") return null;
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-3 bg-card p-6 text-center sm:p-12">
        <h2 className="text-xl uppercase sm:text-2xl">Importing your countdowns…</h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          Moving the clocks that were sitting in this browser up to the cloud.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-4 bg-card p-6 text-center sm:p-12">
        <h2 className="text-xl uppercase sm:text-2xl">Couldn't import — try again</h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          Your local clocks are still in this browser. The cloud copy didn’t land, so nothing was marked
          done.
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
