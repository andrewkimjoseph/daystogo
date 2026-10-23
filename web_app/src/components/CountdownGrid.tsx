import { CalendarDays, Clock, type LucideIcon } from "lucide-react";
import { useTimerFormat } from "@/hooks/useTimerFormat";
import { useEffect } from "react";
import { SignInButton } from "@clerk/tanstack-react-start";
import { CLERK_ENABLED } from "@/lib/authMode";
import { useAuthState } from "@/lib/useAuthState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo } from "@/lib/countdownsRepo";
import { CATEGORIES, categoryMeta, type CountdownCategory } from "@/lib/categories";
import { PALETTE } from "@/lib/palette";
import { useCountdownTick } from "@/hooks/useCountdownTick";
import { CountdownCard } from "./CountdownCard";
import { HourglassLoader } from "./HourglassLoader";

export function CountdownGrid({ variant = "active" }: { variant?: "active" | "archived" }) {
  const archived = variant === "archived";
  const now = useCountdownTick();
  const { format: timerFormat, toggle: toggleFormat } = useTimerFormat();
  const queryClient = useQueryClient();
  const { isSignedIn, isLoaded } = useAuthState();
  const source = isSignedIn ? "cloud" : "local";
  const { data: countdowns } = useQuery({
    queryKey: [...COUNTDOWNS_QUERY_KEY, source, archived ? "archived" : "active"],
    queryFn: () => (archived ? countdownsRepo.archived() : countdownsRepo.all()),
    enabled: isLoaded,
  });
  const search = useSearch({ strict: false }) as { category?: string };
  const navigate = useNavigate();
  const setFilter = (key: CountdownCategory | "all") =>
    void navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev };
        if (key === "all") delete next["category"];
        else next["category"] = key;
        return next as never;
      },
    });

  const onChanged = () => {
    void queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
  };

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    void (async () => {
      await countdownsRepo.reconcile();
      onChanged();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, source]);

  if (!countdowns) return <HourglassLoader />;

  if (countdowns.length === 0) {
    return (
      <div className="brut animate-pop-in mx-auto flex max-w-xl flex-col items-center gap-5 bg-card p-6 text-center sm:p-12">
        <img src="/logo.png" alt="Days To Go" className="w-36 sm:w-48" />
        <h2 className="text-xl uppercase sm:text-2xl">
          {archived ? "Nothing archived yet." : "No countdowns yet."}
        </h2>
        <p className="max-w-sm font-bold text-muted-foreground">
          {archived
            ? "Once a clock hits zero, hit Archive on the card and it lands here for keeps."
            : isLoaded && !isSignedIn
              ? CLERK_ENABLED
                ? "This board lives in this browser. Sign in later if you want the same clocks everywhere."
                : "This board lives in this browser."
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
  const filter: CountdownCategory | "all" =
    used.find((c) => c.key === search.category)?.key ?? "all";
  const visible =
    filter === "all" ? countdowns : countdowns.filter((c) => categoryMeta(c.category).key === filter);

  return (
    <div className="flex flex-col gap-6">
      {!archived && isLoaded && !isSignedIn && CLERK_ENABLED && (
        <div className="brut-thin flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3">
          <p className="font-bold text-muted-foreground">
            This board lives in this browser. Sign in to sync it everywhere.
          </p>
          <SignInButton>
            <button
              type="button"
              className="brut-thin brut-press rounded-none bg-cream px-4 py-2 text-xs font-bold text-ink uppercase"
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      )}
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {used.length > 1 && (
          [
            { key: "all" as const, label: "All", icon: null },
            ...used,
          ] as { key: CountdownCategory | "all"; label: string; icon: LucideIcon | null }[]
        ).map((cat) => {
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
                <span className="flex items-center gap-1.5">
                  {cat.icon ? <cat.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={3} /> : null}
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={toggleFormat}
          aria-pressed={timerFormat === "days"}
          aria-label={timerFormat === "days" ? "Show full breakdown" : "Show days remaining"}
          title={timerFormat === "days" ? "Show full breakdown" : "Show days remaining"}
          className="brut-thin brut-press ml-auto shrink-0 rounded-none bg-cream px-3 py-2 text-xs font-bold text-ink uppercase"
        >
          <span className="flex items-center gap-1.5">
            {timerFormat === "days" ? (
              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
            ) : (
              <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
            )}
            <span className="hidden sm:inline">{timerFormat === "days" ? "Full" : "Days"}</span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((c) => (
          <CountdownCard key={c.id} countdown={c} now={now} variant={variant} onChanged={onChanged} />
        ))}
      </div>
    </div>
  );
}
