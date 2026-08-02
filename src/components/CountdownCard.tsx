import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import type { Countdown } from "@/lib/db";
import { countdownsRepo, remainingMs } from "@/lib/countdownsRepo";
import { formatRemaining, progressPercent } from "@/lib/formatTime";
import { burstConfetti } from "@/lib/confetti";
import { playSound } from "@/lib/soundManager";
import { PALETTE, tagTextColor } from "@/lib/palette";
import { Sparkle } from "./Sparkle";

const SEGMENTS = 16;

export function CountdownCard({
  countdown,
  now,
  onChanged,
}: {
  countdown: Countdown;
  now: number;
  onChanged: () => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const remaining = remainingMs(countdown, now);
  const lapsed = countdown.status === "lapsed" || (countdown.status === "running" && remaining <= 0);
  const { text, dramatic } = formatRemaining(remaining);
  const pct = lapsed ? 100 : progressPercent(countdown.startedAt, countdown.endsAt, remaining);
  const filled = Math.round((pct / 100) * SEGMENTS);
  const urgent = !lapsed && countdown.status === "running" && remaining <= 60_000;

  // Lapse detection + one-time celebration, driven by the shared tick.
  // Celebrate synchronously and guard with a module-level set: the DB writes
  // below re-render this card, which would otherwise cancel the effect midway.
  useEffect(() => {
    if (!lapsed) return;
    if (!countdown.hasCelebrated && !celebrated.has(countdown.id)) {
      celebrated.add(countdown.id);
      burstConfetti(cardRef.current);
      playSound("lapsed");
      void countdownsRepo.markCelebrated(countdown.id);
    }
    if (countdown.status !== "lapsed") {
      void countdownsRepo.markLapsed(countdown.id);
    }
    onChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lapsed, countdown.id, countdown.status, countdown.hasCelebrated]);


  const tagColor = lapsed ? PALETTE.red : countdown.colorTag;
  const badge = lapsed ? "🎉 Lapsed!" : countdown.status === "paused" ? "Paused" : "Running";

  return (
    <article
      ref={cardRef}
      className="brut animate-pop-in relative flex flex-col gap-4 bg-card p-5"
      style={lapsed ? { backgroundImage: `linear-gradient(140deg, ${PALETTE.mauve}, ${PALETTE.red})` } : undefined}
    >
      {lapsed && (
        <>
          <Sparkle color={PALETTE.teal} size={30} className="animate-wiggle absolute -top-4 -left-4" />
          <Sparkle color={PALETTE.cream} size={22} className="absolute -top-3 -right-3" />
        </>
      )}

      <header className="flex items-start justify-between gap-3">
        <h2
          className="text-lg leading-tight break-words uppercase"
          style={lapsed ? { color: PALETTE.cream } : undefined}
        >
          {countdown.title}
        </h2>
        <span
          className="brut-thin shrink-0 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap uppercase"
          style={{ backgroundColor: tagColor, color: tagTextColor(tagColor) }}
        >
          {badge}
        </span>
      </header>

      <p
        className={`tick-numerals ${dramatic ? "text-5xl sm:text-6xl" : "text-4xl"} ${urgent ? "animate-pulse-hard" : ""}`}
        style={{ color: lapsed ? PALETTE.cream : urgent ? PALETTE.red : "var(--ink)" }}
      >
        {text}
      </p>

      <div className="flex gap-[3px]" aria-label={`${Math.round(pct)}% elapsed`}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="h-4 flex-1 border-2 border-ink"
            style={{ backgroundColor: i < filled ? (lapsed ? PALETTE.cream : tagColor) : "transparent" }}
          />
        ))}
      </div>

      {confirmingDelete ? (
        <div className="brut-thin flex items-center justify-between gap-2 bg-destructive p-2">
          <span className="text-sm font-bold text-destructive-foreground uppercase">
            Nuke this countdown?
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await countdownsRepo.remove(countdown.id);
                onChanged();
              }}
              className="brut-thin brut-press rounded-full bg-card px-3 py-1 text-xs font-bold uppercase"
            >
              Do it
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="brut-thin brut-press rounded-full bg-cream px-3 py-1 text-xs font-bold uppercase"
            >
              Nope
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {lapsed ? (
            <button
              type="button"
              onClick={async () => {
                await countdownsRepo.restart(countdown.id);
                playSound("start");
                onChanged();
              }}
              className="brut-thin brut-press flex flex-1 items-center justify-center gap-2 rounded-full bg-cream px-3 py-2 text-sm font-bold uppercase"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={3} /> Run again
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                if (countdown.status === "running") await countdownsRepo.pause(countdown.id);
                else await countdownsRepo.resume(countdown.id);
                onChanged();
              }}
              className="brut-thin brut-press flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-bold text-primary-foreground uppercase"
            >
              {countdown.status === "running" ? (
                <>
                  <Pause className="h-4 w-4" strokeWidth={3} /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" strokeWidth={3} /> Resume
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Delete countdown"
            className="brut-thin brut-press flex h-10 w-10 items-center justify-center rounded-full bg-card"
          >
            <Trash2 className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
      )}
    </article>
  );
}
