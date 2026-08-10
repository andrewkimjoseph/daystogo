import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { localInputValue } from "@/lib/localTime";

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

const pad = (n: number) => String(n).padStart(2, "0");

function parse(value: string): Date {
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : new Date();
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
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface Props {
  /** `YYYY-MM-DDTHH:mm` in local time. */
  value: string;
  onChange: (next: string) => void;
}

type Pane = "days" | "months" | "years";

/** Calendar half of the picker: year, month, and day selection. */
export function BrutalCalendar({ value, onChange }: Props) {
  const selected = useMemo(() => parse(value), [value]);
  const [view, setView] = useState(() => ({ y: selected.getFullYear(), m: selected.getMonth() }));
  const [pane, setPane] = useState<Pane>("days");
  const [yearPage, setYearPage] = useState(() => selected.getFullYear() - 5);
  /** Direction of the last navigation, for the slide animation. 0 = zoom swap. */
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const today = new Date();
  const swapClass = dir === 1 ? "swap-right" : dir === -1 ? "swap-left" : "swap-zoom";

  const days = useMemo(() => monthGrid(view.y, view.m), [view]);
  const years = useMemo(
    () => Array.from({ length: 12 }, (_, i) => yearPage + i),
    [yearPage],
  );

  function commit(d: Date) {
    onChange(localInputValue(d.getTime()));
  }

  function pickDay(d: Date) {
    const next = new Date(d);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    commit(next);
  }

  /** Move the selected date into the given year/month, clamping the day. */
  function moveTo(y: number, m: number) {
    const day = Math.min(selected.getDate(), daysInMonth(y, m));
    const next = new Date(y, m, day, selected.getHours(), selected.getMinutes(), 0, 0);
    setDir(0);
    setView({ y, m });
    setPane("days");
    commit(next);
  }

  function shiftMonth(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setDir(delta > 0 ? 1 : -1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  function shiftYear(delta: number) {
    setDir(delta > 0 ? 1 : -1);
    setView((v) => ({ ...v, y: v.y + delta }));
  }

  function togglePane(next: Pane) {
    setDir(0);
    setPane((p) => (p === next ? "days" : next));
  }

  const arrow = (label: string, side: "l" | "r", onClick: () => void) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="brut-thin brut-press flex h-8 w-8 shrink-0 items-center justify-center bg-cream"
    >
      {side === "l" ? (
        <ChevronLeft className="h-4 w-4" strokeWidth={3} />
      ) : (
        <ChevronRight className="h-4 w-4" strokeWidth={3} />
      )}
    </button>
  );

  return (
    <div className="brut-thin bg-card p-3">
      {/* Year row */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {arrow("Previous year", "l", () => shiftYear(-1))}
        <button
          type="button"
          onClick={() => {
            setYearPage(view.y - 5);
            togglePane("years");
          }}
          aria-pressed={pane === "years"}
          className="brut-thin brut-press tick-numerals flex-1 bg-cream py-1 text-center text-lg"
        >
          <span key={view.y} className="tick-bump inline-block">
            {view.y}
          </span>
        </button>
        {arrow("Next year", "r", () => shiftYear(1))}
      </div>

      {/* Month row */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {arrow("Previous month", "l", () => shiftMonth(-1))}
        <button
          type="button"
          onClick={() => togglePane("months")}
          aria-pressed={pane === "months"}
          className="brut-thin brut-press flex-1 bg-cream py-1 text-center text-sm font-bold uppercase"
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
              const isSelected = y === selected.getFullYear();
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => moveTo(y, view.m)}
                  aria-pressed={isSelected}
                  className={`tick-numerals h-11 text-base sm:h-9 sm:text-sm ${isSelected ? "brut-thin" : ""}`}
                  style={
                    isSelected ? { backgroundColor: PALETTE.teal, color: PALETTE.cream } : undefined
                  }
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
            const isSelected = i === selected.getMonth() && view.y === selected.getFullYear();
            return (
              <button
                key={label}
                type="button"
                onClick={() => moveTo(view.y, i)}
                aria-pressed={isSelected}
                className={`h-11 text-xs font-bold uppercase sm:h-9 ${isSelected ? "brut-thin" : ""}`}
                style={
                  isSelected ? { backgroundColor: PALETTE.teal, color: PALETTE.cream } : undefined
                }
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
            const isSelected = sameDay(d, selected);
            const isToday = sameDay(d, today);
            const outside = d.getMonth() !== view.m;
            const isPast = !isToday && d.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            return (
              <button
                key={d.getTime()}
                type="button"
                disabled={isPast}
                onClick={() => {
                  if (!isPast) pickDay(d);
                }}
                aria-pressed={isSelected}
                className={`tick-numerals h-11 text-base sm:h-9 sm:text-sm ${isSelected ? "brut-thin" : ""} ${
                  isPast
                    ? "cursor-not-allowed text-muted-foreground opacity-40"
                    : outside && !isSelected
                      ? "opacity-35"
                      : ""
                }`}
                style={
                  isSelected
                    ? { backgroundColor: PALETTE.teal, color: PALETTE.cream }
                    : isToday
                      ? { boxShadow: "0 0 0 2px var(--ink) inset" }
                      : undefined
                }
              >
                {d.getDate()}
              </button>
            );
          })}

        </div>
      )}
    </div>
  );
}

/** Time half of the picker: typable hour/minute fields with steppers. */
export function BrutalTimeField({ value, onChange }: Props) {
  const selected = useMemo(() => parse(value), [value]);
  const hours = pad(selected.getHours());
  const minutes = pad(selected.getMinutes());
  // Drafts let the field hold partial text ("", "1") while typing.
  const [draft, setDraft] = useState<{ hours: string | null; minutes: string | null }>({
    hours: null,
    minutes: null,
  });

  // Drop stale drafts if the value changes from elsewhere (e.g. picking a day).
  useEffect(() => {
    setDraft({ hours: null, minutes: null });
  }, [value]);

  function commit(d: Date) {
    onChange(localInputValue(d.getTime()));
  }

  function nudge(unit: "hours" | "minutes", delta: number) {
    const next = new Date(selected);
    if (unit === "hours") next.setHours(next.getHours() + delta);
    else next.setMinutes(next.getMinutes() + delta);
    commit(next);
  }

  function commitText(unit: "hours" | "minutes") {
    const text = draft[unit];
    setDraft((d) => ({ ...d, [unit]: null }));
    if (text === null) return;
    const num = Number(text.replace(/\D/g, ""));
    if (text.trim() === "" || !Number.isFinite(num)) return; // revert
    const max = unit === "hours" ? 23 : 59;
    const clamped = Math.max(0, Math.min(max, num));
    const next = new Date(selected);
    if (unit === "hours") next.setHours(clamped);
    else next.setMinutes(clamped);
    next.setSeconds(0, 0);
    commit(next);
  }

  const field = (label: string, unit: "hours" | "minutes", display: string) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
      <button
        type="button"
        aria-label={`${label} up`}
        onClick={() => nudge(unit, 1)}
        className="brut-thin brut-press flex h-9 w-20 items-center justify-center bg-card"
      >
        <ChevronUp className="h-4 w-4" strokeWidth={3} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        maxLength={2}
        value={draft[unit] ?? display}
        onChange={(e) => setDraft((d) => ({ ...d, [unit]: e.target.value.replace(/\D/g, "") }))}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => commitText(unit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitText(unit);
            e.currentTarget.blur();
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            nudge(unit, 1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            nudge(unit, -1);
          }
        }}
        className="brut-thin tick-numerals w-20 bg-cream py-1 text-center text-2xl outline-none focus:ring-4 focus:ring-primary"
      />
      <button
        type="button"
        aria-label={`${label} down`}
        onClick={() => nudge(unit, -1)}
        className="brut-thin brut-press flex h-9 w-20 items-center justify-center bg-card"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );

  return (
    <div className="brut-thin flex items-start justify-center gap-2 bg-card p-3">
      {field("Hour", "hours", hours)}
      {/* Mirrors a field column so the colon lines up with the numerals. */}
      <div className="flex flex-col items-center gap-1">
        <span aria-hidden className="text-[10px] font-bold uppercase opacity-0">
          .
        </span>
        <span aria-hidden className="block h-9" />
        <span className="tick-numerals py-1 text-2xl leading-[1.9]">:</span>
      </div>
      {field("Min", "minutes", minutes)}
    </div>
  );
}
