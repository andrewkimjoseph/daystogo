import { useCountdownTick } from "@/hooks/useCountdownTick";
import { useHydrated } from "@/hooks/useHydrated";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live wall clock for today — client-only, since the server can't know the viewer's clock. */
export function TodayClock() {
  const hydrated = useHydrated();
  const now = useCountdownTick();

  if (!hydrated) {
    return <div className="brut hidden h-[92px] w-[220px] bg-card sm:block" aria-hidden />;
  }

  const d = new Date(now);
  const date = d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="brut bg-card px-4 py-3 text-right sm:px-5 sm:py-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{date}</p>
      <p className="text-2xl tabular-nums sm:text-3xl">
        {pad(d.getHours())}:{pad(d.getMinutes())}:{pad(d.getSeconds())}
      </p>
    </div>
  );
}
