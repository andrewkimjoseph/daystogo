import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { useQueryClient } from "@tanstack/react-query";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo } from "@/lib/countdownsRepo";
import { resetSessionSync, runSessionSync } from "@/lib/syncMode";

export function LocalImport({ children }: { children: ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    resetSessionSync();
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    let cancelled = false;
    void (async () => {
      try {
        await runSessionSync(userId, () => countdownsRepo.sync(userId));
        await queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
      } catch (error) {
        console.error(error);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, queryClient, attempt]);

  return (
    <>
      {failed && (
        <div className="brut-thin mb-6 flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3">
          <p className="font-bold text-muted-foreground">
            Couldn't sync this browser with the cloud. Your clocks are still here.
          </p>
          <button
            type="button"
            onClick={retry}
            className="brut-thin brut-press rounded-none bg-cream px-4 py-2 text-xs font-bold text-ink uppercase"
          >
            Try again
          </button>
        </div>
      )}
      {children}
    </>
  );
}
