import { useEffect, useState, type ReactNode } from "react";
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
  const [phase, setPhase] = useState<"checking" | "importing" | "ready">("checking");

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
        setPhase("importing");
        await countdownsRepo.importLocal(rows);
        localStorage.setItem(migratedKey(userId), "1");
        await queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
      } catch (error) {
        console.error(error);
        localStorage.setItem(migratedKey(userId), "1");
      }
      if (!cancelled) setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, queryClient]);

  if (phase === "importing") {
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-3 bg-card p-6 text-center sm:p-12">
        <h2 className="text-xl uppercase sm:text-2xl">Importing your countdowns…</h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          Moving the clocks that were sitting in this browser up to the cloud.
        </p>
      </div>
    );
  }

  if (phase !== "ready") return null;
  return children;
}
