import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { countdownsRepo, remainingMs } from "@/lib/countdownsRepo";
import { categoryMeta } from "@/lib/categories";
import { PALETTE, tagTextColor } from "@/lib/palette";
import { formatTargetLabel } from "@/lib/localTime";
import { formatRemaining } from "@/lib/formatTime";
import type { Countdown } from "@/lib/db";
import { useHydrated } from "@/hooks/useHydrated";
import { useCountdownTick } from "@/hooks/useCountdownTick";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

type Pane = "days" | "months" | "years";

const pad = (n: number) => String(n).padStart(2, "0");

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Monday-first grid of 42 dates covering the given month. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

/** When a countdown lands: paused rows project their remaining time from now. */
function endMoment(c: Countdown): number {
  if (c.status === "paused") return Date.now() + Math.max(0, c.pausedRemainingMs ?? 0);
  return c.endsAt;
}


/**
 * The calendar depends entirely on the viewer's clock and timezone, which the
 * server cannot know. Rendering a neutral shell on the server and mounting the
 * real grid only after hydration keeps the first client render byte-identical
 * to the server HTML, so React never has to throw the page away and re-mount.
 */
export function CountdownCalendar() {
  const hydrated = useHydrated();
  if (!hydrated) return <CalendarSkeleton />;
  return <CalendarBody />;
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="brut bg-card p-3 sm:p-4">
        <div className="mb-2 h-9 bg-cream/60" />
        <div className="mb-2 h-9 bg-cream/60" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }, (_, i) => (
            <div key={i} className="h-12 bg-cream/40 sm:h-16" />
          ))}
        </div>
      </div>
      <div className="brut bg-card p-4">
        <div className="h-6 w-2/3 bg-cream/60" />
      </div>
    </div>
  );
}

function CalendarBody() {
  const countdowns = useLiveQuery(() => countdownsRepo.all(), [], undefined);
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [pane, setPane] = useState<Pane>("days");
  const [yearPage, setYearPage] = useState(() => today.getFullYear());
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const swapClass = dir === 1 ? "swap-right" : dir === -1 ? "swap-left" : "swap-zoom";


  useEffect(() => {
    void countdownsRepo.reconcile();
  }, []);

  const days = useMemo(() => monthGrid(view.y, view.m), [view]);
  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => yearPage + i), [yearPage]);

  /** Countdowns bucketed by the local day they end on. */
  const buckets = useMemo(() => {
    const map = new Map<string, Countdown[]>();
    for (const c of countdowns ?? []) {
      const key = dayKey(new Date(endMoment(c)));
      const list = map.get(key);
      if (list) list.push(c);
      else map.set(key, [c]);
    }
    for (const list of map.values()) list.sort((a, b) => endMoment(a) - endMoment(b));
    return map;
  }, [countdowns]);

  const selectedList = buckets.get(dayKey(selected)) ?? [];

  // The past is not bookable: navigation floors at the current month.
  const minY = today.getFullYear();
  const minM = today.getMonth();
  const atFloor = view.y === minY && view.m === minM;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const clamp = (y: number, m: number) =>
    y < minY || (y === minY && m < minM) ? { y: minY, m: minM } : { y, m };

  function shiftMonth(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    const next = clamp(d.getFullYear(), d.getMonth());
    if (next.y === view.y && next.m === view.m) return;
    setDir(delta > 0 ? 1 : -1);
    setView(next);
  }

  function shiftYear(delta: number) {
    const next = clamp(view.y + delta, view.m);
    if (next.y === view.y && next.m === view.m) return;
    setDir(delta > 0 ? 1 : -1);
    setView(next);
  }

  function togglePane(next: Pane) {
    setDir(0);
    setPane((p) => (p === next ? "days" : next));
  }

  function jumpTo(y: number, m: number) {
    setDir(0);
    setView(clamp(y, m));
    setPane("days");
  }

  const arrow = (label: string, side: "l" | "r", onClick: () => void, disabled = false) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="brut-thin brut-press flex h-9 w-9 shrink-0 items-center justify-center bg-cream disabled:pointer-events-none disabled:opacity-35"
    >
      {side === "l" ? (
        <ChevronLeft className="h-4 w-4" strokeWidth={3} />
      ) : (
        <ChevronRight className="h-4 w-4" strokeWidth={3} />
      )}
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="brut bg-card p-3 sm:p-4">
        {/* Year row */}
        <div className="mb-2 flex items-center justify-between gap-2">
          {arrow("Previous year", "l", () => shiftYear(-1), view.y <= minY)}

          <button
            type="button"
            onClick={() => {
              setYearPage(view.y - 5);
              togglePane("years");
            }}
            aria-pressed={pane === "years"}
            className="brut-thin brut-press tick-numerals flex-1 bg-cream py-2 text-center text-lg"
          >
            <span key={view.y} className="tick-bump inline-block">
              {view.y}
            </span>
          </button>
          {arrow("Next year", "r", () => shiftYear(1))}
        </div>

        {/* Month row */}
        <div className="mb-2 flex items-center justify-between gap-2">
          {arrow("Previous month", "l", () => shiftMonth(-1), atFloor)}
          <button
            type="button"
            onClick={() => togglePane("months")}
            aria-pressed={pane === "months"}
            className="brut-thin brut-press flex-1 bg-cream py-2 text-center text-sm font-bold uppercase"
          >
            <span key={view.m} className="tick-bump inline-block">
              {MONTHS[view.m]}
            </span>
          </button>
          {arrow("Next month", "r", () => shiftMonth(1))}
        </div>

        {pane === "years" && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              {arrow("Previous years", "l", () => {
                setDir(-1);
                setYearPage((y) => y - 12);
              })}
              <span className="tick-numerals flex-1 text-center text-xs">
                {years[0]} – {years[years.length - 1]}
              </span>
              {arrow("Next years", "r", () => {
                setDir(1);
                setYearPage((y) => y + 12);
              })}
            </div>
            <div key={`years-${yearPage}`} className={`grid grid-cols-4 gap-1 ${swapClass}`}>
              {years.map((y) => {
                const on = y === view.y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => jumpTo(y, view.m)}
                    aria-pressed={on}
                    className={`tick-numerals h-11 text-base ${on ? "brut-thin" : ""}`}
                    style={on ? { backgroundColor: PALETTE.teal, color: PALETTE.cream } : undefined}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {pane === "months" && (
          <div key={`months-${view.y}`} className={`grid grid-cols-3 gap-1 ${swapClass}`}>
            {MONTHS_SHORT.map((label, i) => {
              const on = i === view.m;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => jumpTo(view.y, i)}
                  aria-pressed={on}
                  className={`h-11 text-xs font-bold uppercase ${on ? "brut-thin" : ""}`}
                  style={on ? { backgroundColor: PALETTE.teal, color: PALETTE.cream } : undefined}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {pane === "days" && (
          <div key={`days-${view.y}-${view.m}`} className={`grid grid-cols-7 gap-1 ${swapClass}`}>
            {WEEKDAYS.map((w, i) => (
              <span
                key={i}
                className="pb-1 text-center text-[10px] font-bold uppercase text-muted-foreground"
              >
                {w}
              </span>
            ))}
            {days.map((d) => {
              const marks = buckets.get(dayKey(d)) ?? [];
              const isSelected = sameDay(d, selected);
              const isToday = sameDay(d, today);
              const outside = d.getMonth() !== view.m;
              return (
                <button
                  key={d.getTime()}
                  type="button"
                  onClick={() => setSelected(new Date(d))}
                  aria-pressed={isSelected}
                  aria-label={`${d.toDateString()}${marks.length ? `, ${marks.length} countdown${marks.length === 1 ? "" : "s"}` : ""}`}
                  className={`tick-numerals relative flex h-12 flex-col items-center justify-center gap-1 text-sm sm:h-16 sm:text-base ${
                    isSelected ? "brut-thin" : ""
                  } ${outside && !isSelected ? "opacity-35" : ""}`}
                  style={
                    isSelected
                      ? { backgroundColor: PALETTE.teal, color: PALETTE.cream }
                      : isToday
                        ? { boxShadow: "0 0 0 2px var(--ink) inset" }
                        : undefined
                  }
                >
                  <span>{d.getDate()}</span>
                  <span className="flex h-2 items-center gap-[3px]">
                    {marks.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="block h-1.5 w-1.5 border border-ink"
                        style={{ backgroundColor: c.colorTag }}
                      />
                    ))}
                    {marks.length > 3 && (
                      <span className="text-[9px] leading-none font-bold">+{marks.length - 3}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <DayPanel date={selected} items={selectedList} />
    </div>
  );
}

function DayPanel({ date, items }: { date: Date; items: Countdown[] }) {
  // Only ever rendered after hydration, so viewer-locale formatting is safe here.
  const heading = date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  const newCountdownLink = (
    <Link
      to="/create-countdown"
      search={{ date: dayKey(date) }}
      viewTransition
      className="brut-thin brut-press bg-primary px-4 py-2 text-xs font-bold text-primary-foreground uppercase"
    >
      New countdown
    </Link>
  );

  return (
    <div className="brut flex flex-col gap-3 bg-card p-4">
      <div>
        <h2 className="text-lg uppercase sm:text-xl">{heading}</h2>
        <p className="text-xs font-bold uppercase text-muted-foreground">
          {items.length === 0
            ? "Nothing lands here"
            : `${items.length} countdown${items.length === 1 ? "" : "s"} lands here`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="font-bold text-muted-foreground">
            A blank day. Suspiciously calm — want to put a clock on something?
          </p>
          {newCountdownLink}
        </div>
      ) : (
        <>
          <div className="flex">{newCountdownLink}</div>

        <ul className="flex flex-col gap-2">
          {items.map((c) => (
            <li key={c.id}>
              <DayPanelRow countdown={c} />
            </li>
          ))}
        </ul>

        </>
      )}
    </div>
  );
}

/** One row in the day panel: static landing moment plus a live to-the-second ticker. */
function DayPanelRow({ countdown }: { countdown: Countdown }) {
  const now = useCountdownTick();
  const meta = categoryMeta(countdown.category);
  const Icon = meta.icon;
  const remaining = remainingMs(countdown, now);
  const lapsed = countdown.status === "lapsed" || remaining <= 0;
  const { text } = formatRemaining(remaining);

  return (
    <Link
      to="/"
      viewTransition
      className="brut-thin brut-press flex items-start gap-3 bg-cream p-3"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink"
        style={{ backgroundColor: countdown.colorTag, color: tagTextColor(countdown.colorTag) }}
      >
        <Icon className="h-4 w-4" strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold uppercase break-words">{countdown.title}</span>
        <span className="block text-xs tabular-nums text-muted-foreground">
          {lapsed ? "Lapsed" : `${text} to go`}
        </span>
      </span>
    </Link>
  );
}

