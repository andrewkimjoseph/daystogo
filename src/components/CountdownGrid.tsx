import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo } from "@/lib/countdownsRepo";
import { CATEGORIES, categoryMeta, type CountdownCategory } from "@/lib/categories";
import { PALETTE } from "@/lib/palette";
import { useCountdownTick } from "@/hooks/useCountdownTick";
import { CountdownCard } from "./CountdownCard";

export function CountdownGrid({ variant = "active" }: { variant?: "active" | "archived" }) {
  const archived = variant === "archived";
  const now = useCountdownTick();
  const queryClient = useQueryClient();
  const { data: countdowns } = useQuery({
    queryKey: [...COUNTDOWNS_QUERY_KEY, archived ? "archived" : "active"],
    queryFn: () => (archived ? countdownsRepo.archived() : countdownsRepo.all()),
  });
  const [filter, setFilter] = useState<CountdownCategory | "all">("all");

  const onChanged = () => {
    void queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
  };

  useEffect(() => {
    void (async () => {
      await countdownsRepo.reconcile();
      onChanged();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!countdowns) return null;

  if (countdowns.length === 0) {
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-5 bg-card p-6 text-center sm:p-12">
        <img src={logoUrl} alt="Days To Go" className="w-36 sm:w-48" />
        <h2 className="text-xl uppercase sm:text-2xl">
          {archived ? "Nothing archived yet." : "No countdowns yet."}
        </h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          {archived
            ? "Once a clock hits zero, hit Archive on the card and it lands here for keeps."
            : "What are you waiting for? Pick something, put a clock on it, watch it sweat."}
        </p>
        <Link
          to={archived ? "/" : "/create-countdown"}
          className="brut-thin brut-press rounded-none bg-primary px-5 py-3 font-bold text-primary-foreground uppercase"
        >
          {archived ? "Back to the board" : "Start one now"}
        </Link>
      </div>
    );
  }

  const used = CATEGORIES.filter((cat) =>
    countdowns.some((c) => categoryMeta(c.category).key === cat.key),
  );
  const visible =
    filter === "all" ? countdowns : countdowns.filter((c) => categoryMeta(c.category).key === filter);

  return (
    <div className="flex flex-col gap-6">
      {used.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {[{ key: "all" as const, label: "All" }, ...used].map((cat) => {
            const on = filter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFilter(cat.key)}
                aria-pressed={on}
                className="brut-thin brut-press rounded-none px-3 py-2 text-xs font-bold uppercase"
                style={
                  on
                    ? { backgroundColor: PALETTE.mauve, color: PALETTE.cream }
                    : { backgroundColor: "var(--cream)" }
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((c) => (
          <CountdownCard key={c.id} countdown={c} now={now} variant={variant} onChanged={onChanged} />
        ))}
      </div>
    </div>
  );
}
