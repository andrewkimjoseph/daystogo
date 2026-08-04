import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { DurationType } from "@/lib/db";
import { countdownsRepo, toSeconds, validateSeconds } from "@/lib/countdownsRepo";
import { COLOR_TAGS, PALETTE, tagTextColor } from "@/lib/palette";
import { CATEGORIES, type CountdownCategory } from "@/lib/categories";
import { playSound } from "@/lib/soundManager";
import { localInputValue, spanFromNow } from "@/lib/localTime";
import { BrutalCalendar, BrutalTimeField } from "./BrutalDateTimePicker";
import { useHydrated } from "@/hooks/useHydrated";

const TYPES: { key: DurationType; label: string; max: number }[] = [
  { key: "seconds", label: "Secs", max: 60 },
  { key: "minutes", label: "Mins", max: 60 },
  { key: "hours", label: "Hours", max: 24 },
];

type Mode = "duration" | "target";

/** Keep a typed duration inside 1..max, falling back to 1 for junk input. */
function clampValue(raw: string, max: number): number {
  const num = Math.floor(Number(raw));
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(num, max);
}


/** `YYYY-MM-DD` -> local start of that day, or null when unusable. */
function parseDayParam(raw: string | undefined): Date | null {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 9, 0, 0, 0);
  return Number.isFinite(d.getTime()) ? d : null;
}

export function CreateCountdownForm({ initialDate }: { initialDate?: string }) {
  const navigate = useNavigate();
  const seededDay = parseDayParam(initialDate);
  const [mode, setMode] = useState<Mode>(seededDay ? "target" : "duration");
  const [title, setTitle] = useState("");
  const [durationType, setDurationType] = useState<DurationType>("hours");
  const [value, setValue] = useState("24");
  const [targetInput, setTargetInput] = useState("");
  const [colorTag, setColorTag] = useState<string>(PALETTE.teal);
  const [category, setCategory] = useState<CountdownCategory>("other");
  const [error, setError] = useState<string | null>(null);

  // The viewer's clock and locale are unknown during SSR, so anything derived
  // from them waits for hydration.
  const hydrated = useHydrated();
  useEffect(() => {
    // A day picked in the calendar seeds 09:00 local; fall back to an hour out
    // whenever that moment has already passed (or no date came along).
    const soon = Date.now() + 3600_000;
    const seeded = seededDay && seededDay.getTime() > Date.now() ? seededDay.getTime() : soon;
    setTargetInput((prev) => prev || localInputValue(seeded));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate]);

  // Previews now quote seconds, so they have to re-render every second.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [hydrated]);

  const activeType = TYPES.find((t) => t.key === durationType)!;
  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const targetPreview = targetInput && hydrated ? spanFromNow(targetInput) : null;
  const durationPreview = (() => {
    if (!hydrated) return null;
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return null;
    const seconds = toSeconds(durationType, num);
    const end = new Date(Date.now() + seconds * 1000);
    return end.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  })();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Every countdown needs a name. Go on.");
      return;
    }

    if (mode === "target") {
      const targetAt = new Date(targetInput).getTime();
      if (!Number.isFinite(targetAt)) {
        setError("Pick a date and time we can actually count to.");
        return;
      }
      const seconds = Math.round((targetAt - Date.now()) / 1000);
      if (seconds <= 0) {
        setError("That moment has already been and gone. Pick a future one.");
        return;
      }
      const problem = validateSeconds(seconds);
      if (problem) {
        setError(problem);
        return;
      }
      await countdownsRepo.create({ mode: "target", title, targetAt, colorTag, category });
    } else {
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0 || !Number.isInteger(num)) {
        setError("That's not a number we can count down from.");
        return;
      }
      if (num > activeType.max) {
        setError(`Max is ${activeType.max} ${activeType.label.toLowerCase()} — use End time for longer.`);
        setValue(String(activeType.max));
        return;
      }

      const problem = validateSeconds(toSeconds(durationType, num));
      if (problem) {
        setError(problem);
        return;
      }
      await countdownsRepo.create({
        title,
        durationType,
        durationValue: num,
        colorTag,
        category,
      });
    }

    playSound("start");
    void navigate({ to: "/" });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-stretch">
      {/* Heading row: the submit button rides along so it never needs scrolling to. */}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:col-span-2">
        <div className="min-w-0">
          <h1 className="hero-gradient text-3xl uppercase sm:text-5xl">New countdown</h1>
          <p className="mt-2 max-w-xl font-bold text-muted-foreground">
            Count a stretch of time, or count to an exact moment. Either way it starts the second
            you hit go.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="submit"
            className="brut brut-press w-full rounded-none bg-primary px-6 py-3 text-base font-bold text-primary-foreground uppercase sm:w-auto sm:py-4 sm:text-lg"
          >
            Start the clock
          </button>
          {error && (
            <p
              className="brut-thin px-3 py-2 text-sm font-bold uppercase"
              style={{ backgroundColor: PALETTE.red, color: PALETTE.cream }}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Left column: the basics */}

      <div className="brut h-full bg-card p-4 sm:p-6">
        <span className="mb-2 block text-xs font-bold uppercase">How do we count?</span>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6">
          {(
            [
              { key: "duration", label: "Duration" },
              { key: "target", label: "End time" },
            ] as { key: Mode; label: string }[]
          ).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setMode(m.key);
                setError(null);
              }}
              aria-pressed={mode === m.key}
              className="brut-thin brut-press rounded-none px-3 py-3 text-sm font-bold uppercase"
              style={
                mode === m.key
                  ? { backgroundColor: PALETTE.mauve, color: PALETTE.cream }
                  : { backgroundColor: "var(--cream)" }
              }
            >
              {m.label}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-xs font-bold uppercase" htmlFor="title">
          What are we waiting for?
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Ship the launch"
          className="brut-thin mb-5 w-full bg-cream sm:mb-6 px-3 py-3 font-bold outline-none focus:ring-4 focus:ring-primary"
        />

        <span className="mb-2 block text-xs font-bold uppercase">Colour tag</span>
        <div className="mb-5 flex flex-wrap gap-2 sm:mb-6">
          {COLOR_TAGS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColorTag(c.hex)}
              aria-label={c.label}
              aria-pressed={colorTag === c.hex}
              className="brut-thin brut-press h-11 w-11 rounded-none"
              style={{
                backgroundColor: c.hex,
                boxShadow: colorTag === c.hex ? "0 0 0 4px var(--ink) inset" : undefined,
                color: tagTextColor(c.hex),
              }}
            />
          ))}
        </div>

        <span className="mb-2 block text-xs font-bold uppercase">Category</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const on = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={on}
                className="brut-thin brut-press flex min-h-[56px] items-center gap-2 rounded-none px-2 py-2 text-left text-[11px] font-bold uppercase"
                style={
                  on
                    ? { backgroundColor: PALETTE.mauve, color: PALETTE.cream }
                    : { backgroundColor: "var(--cream)" }
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                <span className="min-w-0 break-words">{c.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm font-bold text-muted-foreground">{activeCategory.hint}</p>
      </div>

      {/* Right column: how long */}
      <div className="brut h-full bg-card p-4 sm:p-6">
        {mode === "target" ? (
          <>
            <span className="mb-2 block text-xs font-bold uppercase">
              End it at (your local time)
            </span>
            {targetInput ? (
              <>
                <BrutalCalendar
                  value={targetInput}
                  onChange={(next: string) => {
                    setTargetInput(next);
                    setError(null);
                  }}
                />
                <span className="mt-6 mb-2 block text-xs font-bold uppercase">
                  Time (type it or tap)
                </span>
                <BrutalTimeField
                  value={targetInput}
                  onChange={(next: string) => {
                    setTargetInput(next);
                    setError(null);
                  }}
                />
                <p className="mt-3 text-sm font-bold text-muted-foreground">
                  {targetPreview ?? "Pick a date and time."}
                </p>
              </>
            ) : (
              <div className="brut-thin h-[520px] bg-card sm:h-[620px]" aria-hidden />
            )}
          </>
        ) : (
          <>
            <span className="mb-2 block text-xs font-bold uppercase">Duration type</span>
            <div className="mb-5 grid grid-cols-3 gap-2 sm:mb-6">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setDurationType(t.key);
                    setValue(String(clampValue(value, t.max)));
                    setError(null);
                  }}

                  aria-pressed={durationType === t.key}
                  className="brut-thin brut-press rounded-none px-3 py-3 text-sm font-bold uppercase"
                  style={
                    durationType === t.key
                      ? { backgroundColor: PALETTE.teal, color: PALETTE.cream }
                      : { backgroundColor: "var(--cream)" }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-xs font-bold uppercase" htmlFor="value">
              How many {activeType.label.toLowerCase()}? (max {activeType.max.toLocaleString()})
            </label>
            <input
              id="value"
              type="number"
              inputMode="numeric"
              min={1}
              max={activeType.max}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              onBlur={() => setValue(String(clampValue(value, activeType.max)))}
              className="tick-numerals brut-thin w-full bg-cream px-3 py-3 text-2xl outline-none focus:ring-4 focus:ring-primary"
            />

            <p className="mt-3 text-sm font-bold text-muted-foreground">
              {durationPreview ? `Lands on ${durationPreview}.` : "Pick a number above zero."}
            </p>
          </>
        )}
      </div>
    </form>
  );
}
