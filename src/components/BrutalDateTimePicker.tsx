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

interface Props {
  /** `YYYY-MM-DDTHH:mm` in local time. */
  value: string;
  onChange: (next: string) => void;
}

export function BrutalDateTimePicker({ value, onChange }: Props) {
  const selected = useMemo(() => parse(value), [value]);
  const [view, setView] = useState(() => ({ y: selected.getFullYear(), m: selected.getMonth() }));
  const today = new Date();

  const days = useMemo(() => monthGrid(view.y, view.m), [view]);

  function commit(d: Date) {
    onChange(localInputValue(d.getTime()));
  }

  function pickDay(d: Date) {
    const next = new Date(d);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
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
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  function preset(kind: "tonight" | "tomorrow" | "week") {
    const next = new Date();
    next.setSeconds(0, 0);
    if (kind === "tonight") next.setHours(18, 0);
    if (kind === "tomorrow") {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0);
    }
    if (kind === "week") next.setDate(next.getDate() + 7);
    commit(next);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  }

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
        className="brut-thin brut-press flex h-7 w-14 items-center justify-center bg-card"
      >
        <ChevronUp className="h-4 w-4" strokeWidth={3} />
      </button>
      <span className="tick-numerals w-14 py-1 text-center text-2xl">{display}</span>
      <button
        type="button"
        aria-label={`${label} down`}
        onClick={() => nudge(unit, -step)}
        className="brut-thin brut-press flex h-7 w-14 items-center justify-center bg-card"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );

  return (
    <div className="brut-thin bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="brut-thin brut-press flex h-8 w-8 items-center justify-center bg-cream"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={3} />
        </button>
        <span className="text-sm font-bold uppercase">
          {MONTHS[view.m]} {view.y}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="brut-thin brut-press flex h-8 w-8 items-center justify-center bg-cream"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
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
              className={`tick-numerals h-9 text-sm ${isSelected ? "brut-thin" : ""} ${
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

      <div className="mt-3 flex items-end justify-center gap-2 border-t-2 border-[var(--ink)] pt-3">
        {stepper("Hour", pad(selected.getHours()), "hours", 1)}
        <span className="tick-numerals pb-6 text-2xl">:</span>
        {stepper("Min", pad(selected.getMinutes()), "minutes", 5)}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            { key: "tonight", label: "Tonight 18:00" },
            { key: "tomorrow", label: "Tomorrow 09:00" },
            { key: "week", label: "+1 week" },
          ] as const
        ).map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => preset(p.key)}
            className="brut-thin brut-press flex-1 bg-cream px-2 py-1.5 text-[11px] font-bold uppercase"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
