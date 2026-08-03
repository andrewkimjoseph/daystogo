import { useMemo, useState } from "react";
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

export function BrutalDateTimePicker({ value, onChange }: Props) {
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

  function nudge(unit: "hours" | "minutes", delta: number) {
    const next = new Date(selected);
    if (unit === "hours") next.setHours(next.getHours() + delta);
    else next.setMinutes(next.getMinutes() + delta);
    commit(next);
    setView({ y: next.getFullYear(), m: next.getMonth() });
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

  function preset(kind: "tonight" | "tomorrow" | "week" | "year") {
    const next = new Date();
    next.setSeconds(0, 0);
    if (kind === "tonight") next.setHours(18, 0);
    if (kind === "tomorrow") {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0);
    }
    if (kind === "week") next.setDate(next.getDate() + 7);
    if (kind === "year") next.setFullYear(next.getFullYear() + 1);
    commit(next);
    setDir(0);
    setView({ y: next.getFullYear(), m: next.getMonth() });
    setPane("days");
  }


  const arrow = (label: string, dir: "l" | "r", onClick: () => void) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="brut-thin brut-press flex h-8 w-8 shrink-0 items-center justify-center bg-cream"
    >
      {dir === "l" ? (
        <ChevronLeft className="h-4 w-4" strokeWidth={3} />
      ) : (
        <ChevronRight className="h-4 w-4" strokeWidth={3} />
      )}
    </button>
  );

  const stepper = (
    label: string,
    display: string,
    unit: "hours" | "minutes",
    step: number,
  ) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
      <button
        type="button"
        aria-label={`${label} up`}
        onClick={() => nudge(unit, step)}
        className="brut-thin brut-press flex h-9 w-16 items-center justify-center bg-card sm:h-7 sm:w-14"
      >
        <ChevronUp className="h-4 w-4" strokeWidth={3} />
      </button>
      <span
        key={display}
        className="tick-numerals tick-bump w-16 py-1 text-center text-2xl sm:w-14"
      >
        {display}
      </span>
      <button
        type="button"
        aria-label={`${label} down`}
        onClick={() => nudge(unit, -step)}
        className="brut-thin brut-press flex h-9 w-16 items-center justify-center bg-card sm:h-7 sm:w-14"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
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
            return (
              <button
                key={d.getTime()}
                type="button"
                onClick={() => pickDay(d)}
                aria-pressed={isSelected}
                className={`tick-numerals h-11 text-base sm:h-9 sm:text-sm ${isSelected ? "brut-thin" : ""} ${
                  outside && !isSelected ? "opacity-35" : ""
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

      <div className="mt-3 flex items-end justify-center gap-2 border-t-2 border-[var(--ink)] pt-3">
        {stepper("Hour", pad(selected.getHours()), "hours", 1)}
        <span className="tick-numerals pb-6 text-2xl">:</span>
        {stepper("Min", pad(selected.getMinutes()), "minutes", 1)}
      </div>

    </div>
  );
}
