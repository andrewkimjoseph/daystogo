import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useBackClick } from "@/hooks/useBackClick";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "@/lib/useAuthState";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { downloadCountdownImage } from "@/lib/shareImage";
import { SiteHeader } from "@/components/SiteHeader";
import { HourglassLoader } from "@/components/HourglassLoader";
import { FittedCountdownTimer } from "@/components/FittedCountdownTimer";
import { Sparkle } from "@/components/Sparkle";
import { useHydrated } from "@/hooks/useHydrated";
import { useCountdownTick } from "@/hooks/useCountdownTick";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo, remainingMs } from "@/lib/countdownsRepo";
import type { Countdown } from "@/lib/db";
import { formatRemaining, progressPercent } from "@/lib/formatTime";
import { formatTargetLabel } from "@/lib/localTime";
import { isRecurring, recurrenceBadgeLabel } from "@/lib/recurrence";
import { categoryMeta } from "@/lib/categories";
import { burstConfetti } from "@/lib/confetti";
import { playSound } from "@/lib/soundManager";
import { PALETTE } from "@/lib/palette";

export const Route = createFileRoute("/countdowns/$countdownId")({
  head: () => ({
    meta: [
      { title: "Countdown — Days To Go" },
      { name: "description", content: "One countdown, full screen, ticking toward its moment." },
      { property: "og:title", content: "Countdown — Days To Go" },
      { property: "og:description", content: "One countdown, full screen, ticking toward its moment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CountdownPage,
});

const SEGMENTS = 24;

function CountdownPage() {
  const { countdownId } = Route.useParams();
  const hydrated = useHydrated();
  const { isSignedIn, isLoaded } = useAuthState();
  const source = isSignedIn ? "cloud" : "local";
  const [saving, setSaving] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: [...COUNTDOWNS_QUERY_KEY, source, "one", countdownId],
    queryFn: () => countdownsRepo.byId(countdownId),
    enabled: hydrated && isLoaded,
  });

  const handleDownload = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await downloadCountdownImage(data, Date.now(), { showId: !!isSignedIn });
      toast.success("Share image downloaded");
    } catch {
      toast.error("Couldn't make the image. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="countdown-static-page mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-4 flex justify-end gap-3 sm:mb-6">
          {data && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={saving}
              aria-label="Download countdown as PNG"
              title="Download as PNG"
              className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-3 py-2.5 text-xs font-bold text-ink uppercase disabled:opacity-60 sm:px-4 sm:py-3 sm:text-sm"
            >
              <Download className="h-4 w-4" strokeWidth={3} /> Save PNG
            </button>
          )}
          <Link
            to="/"
            onClick={onBack}
            viewTransition
            className="brut brut-press inline-flex items-center gap-2 rounded-none bg-cream px-3 py-2.5 text-xs font-bold text-ink uppercase sm:px-4 sm:py-3 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Back to the timers
          </Link>
        </div>
        {!hydrated || !isLoaded || isLoading || data === undefined ? (
          <HourglassLoader />
        ) : data ? (
          <BigCountdown countdown={data} showId={!!isSignedIn} />
        ) : (
          <div className="brut bg-card p-8 sm:p-12">
            <h1 className="text-3xl uppercase sm:text-5xl">Countdown not found</h1>
            <p className="mt-3 font-bold text-muted-foreground">
              This clock isn't on this device or account.
            </p>
            <Link
              to="/"
              className="brut brut-press mt-6 inline-flex rounded-none bg-teal px-4 py-3 text-sm font-bold uppercase text-ink"
            >
              Go home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

const celebrated = new Set<string>();

function BigCountdown({ countdown, showId }: { countdown: Countdown; showId: boolean }) {
  const now = useCountdownTick();
  const queryClient = useQueryClient();
  const ref = useRef<HTMLElement | null>(null);
  const remaining = remainingMs(countdown, now);
  const lapsed = remaining <= 0;
  const { text } = formatRemaining(remaining, now, countdown.endsAt);
  const pct = lapsed ? 100 : progressPercent(countdown.startedAt, countdown.endsAt, remaining);
  const filled = Math.round((pct / 100) * SEGMENTS);
  const category = categoryMeta(countdown.category);
  const Icon = category.icon;
  const recurring = isRecurring(countdown);
  const fg = lapsed ? PALETTE.cream : "var(--muted-foreground)";

  useEffect(() => {
    if (!lapsed || celebrated.has(countdown.id)) return;
    celebrated.add(countdown.id);
    const refresh = () => void queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });
    if (!countdown.hasCelebrated || recurring) {
      burstConfetti(ref.current);
      playSound("lapsed");
    }
    if (recurring && !countdown.archivedAt) {
      void countdownsRepo.restart(countdown).finally(() => {
        celebrated.delete(countdown.id);
        refresh();
      });
      return;
    }
    if (!countdown.hasCelebrated) void countdownsRepo.markCelebrated(countdown.id);
    if (countdown.status !== "lapsed") void countdownsRepo.markLapsed(countdown.id).then(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lapsed, countdown.id]);


  return (
    <article
      ref={ref}
      className="brut relative flex min-h-[70vh] flex-col gap-6 bg-card p-6 sm:gap-8 sm:p-12"
      style={lapsed ? { backgroundImage: `linear-gradient(140deg, ${PALETTE.mauve}, ${PALETTE.red})` } : undefined}
    >
      {lapsed && (
        <>
          <Sparkle color={PALETTE.teal} size={40} className="animate-wiggle absolute -top-5 -left-5" />
          <Sparkle color={PALETTE.cream} size={28} className="absolute -top-4 -right-4" />
        </>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-14 w-14 sm:h-20 sm:w-20"
        style={{
          backgroundColor: lapsed ? PALETTE.cream : countdown.colorTag,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase sm:text-sm" style={{ color: fg }}>
            <Icon className="h-4 w-4 shrink-0" strokeWidth={3} />
            {category.label}
          </p>
          <h1
            className="text-3xl leading-tight break-words uppercase sm:text-6xl"
            style={lapsed ? { color: PALETTE.cream } : undefined}
          >
            {countdown.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold uppercase sm:text-lg" style={{ color: fg }}>
            {formatTargetLabel(countdown.targetAt)}
            {recurring && (
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                {recurrenceBadgeLabel(countdown.recurrence)}
              </span>
            )}
          </p>
        </div>
        <img
          src="/hourglass.svg"
          alt={lapsed ? "Lapsed" : "Running"}
          className="h-14 w-14 shrink-0 sm:h-20 sm:w-20"
        />
      </header>

      <FittedCountdownTimer text={text} lapsed={lapsed} />

      <section>
        <div className="mb-2 flex items-end justify-between gap-3 text-xs font-bold uppercase sm:text-sm" style={{ color: fg }}>
          <span>How far along</span>
          <span className="tabular-nums">{Math.floor(pct)}%</span>
        </div>
        <div className="flex gap-1 sm:gap-1.5" aria-label={`${Math.floor(pct)}% elapsed`}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className="h-5 flex-1 border-2 border-ink sm:h-8 sm:border-[3px]"
              style={{ backgroundColor: i < filled ? (lapsed ? PALETTE.cream : PALETTE.red) : "transparent" }}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] font-bold uppercase sm:text-xs" style={{ color: fg }}>
          <span>Started {formatTargetLabel(countdown.startedAt)}</span>
          <span>Lands {formatTargetLabel(countdown.endsAt)}</span>
        </div>
      </section>

      <footer className="pr-12 text-[10px] font-bold uppercase sm:pr-16 sm:text-xs" style={{ color: fg }}>
        <p>Created on {formatTargetLabel(countdown.createdAt)}</p>
        {showId && <p className="mt-1 break-all">ID / {countdown.id}</p>}
      </footer>
    </article>
  );
}
