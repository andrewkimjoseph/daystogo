import type { LucideIcon } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { PALETTE } from "#/lib/palette";
import { formatRemaining, formatTargetLabel, progressPercent } from "#/lib/formatTime";

const SEGMENTS = 16;

export interface DemoCountdown {
  id: string;
  title: string;
  category: string;
  CategoryIcon: LucideIcon;
  colorTag: string;
  recurrence?: string;
  startedAt: number;
  endsAt: number;
}

export function DemoCountdownCard({ countdown, now }: { countdown: DemoCountdown; now: number }) {
  const remaining = Math.max(0, countdown.endsAt - now);
  const { text, dramatic } = formatRemaining(remaining, now, countdown.endsAt);
  const lapsed = remaining <= 0;
  const urgent = dramatic && !lapsed;
  const pct = progressPercent(countdown.startedAt, countdown.endsAt, remaining);
  const filled = Math.round((pct / 100) * SEGMENTS);
  const tagColor = lapsed ? PALETTE.red : countdown.colorTag;
  const CategoryIcon = countdown.CategoryIcon;

  return (
    <article
      className="countdown-card brut animate-pop-in relative flex flex-col gap-3 bg-card p-4 sm:gap-4 sm:p-5"
      style={lapsed ? { backgroundImage: `linear-gradient(140deg, ${PALETTE.mauve}, ${PALETTE.red})` } : undefined}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-7 w-7"
        style={{
          backgroundColor: lapsed ? PALETTE.cream : countdown.colorTag,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase"
            style={{ color: lapsed ? PALETTE.cream : "var(--muted-foreground)" }}
          >
            <CategoryIcon className="h-3 w-3 shrink-0" strokeWidth={3} />
            <span className="truncate">{countdown.category}</span>
          </p>
          <h2
            className="text-base leading-tight break-words uppercase sm:text-lg"
            style={lapsed ? { color: PALETTE.cream } : undefined}
          >
            {countdown.title}
          </h2>
          <p
            className="mt-1 flex items-center gap-1.5 text-xs font-bold uppercase"
            style={{ color: lapsed ? PALETTE.cream : "var(--muted-foreground)" }}
          >
            {formatTargetLabel(countdown.endsAt)}
            {countdown.recurrence ? (
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="h-3 w-3 shrink-0" strokeWidth={3} aria-hidden="true" />
                <span>{countdown.recurrence}</span>
              </span>
            ) : null}
          </p>
        </div>
        <img
          src="/hourglass.svg"
          alt={lapsed ? "Lapsed" : "Running"}
          title={lapsed ? "Lapsed" : "Running"}
          className="h-10 w-10 shrink-0"
        />
      </header>

      <p
        className={`tick-numerals whitespace-nowrap text-xl sm:text-2xl ${urgent ? "animate-pulse-hard" : ""}`}
        style={{ color: lapsed ? PALETTE.cream : urgent ? PALETTE.red : "var(--ink)" }}
      >
        {text}
      </p>

      <div className="mt-auto flex gap-[3px]" aria-label={`${Math.round(pct)}% elapsed`}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="h-4 flex-1 border-2 border-ink"
            style={{ backgroundColor: i < filled ? (lapsed ? PALETTE.cream : tagColor) : "transparent" }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[10px] font-bold uppercase"
          style={{ color: lapsed ? PALETTE.cream : "var(--muted-foreground)" }}
        >
          Demo clock
        </p>
        <img src="/logo.png" alt="Days To Go" className="h-10 w-auto opacity-80" />
      </div>
    </article>
  );
}
