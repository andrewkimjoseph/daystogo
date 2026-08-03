import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { DurationType } from "@/lib/db";
import { countdownsRepo, toSeconds, validateSeconds } from "@/lib/countdownsRepo";
import { COLOR_TAGS, PALETTE, tagTextColor } from "@/lib/palette";
import { playSound } from "@/lib/soundManager";
import { localInputValue, spanFromNow } from "@/lib/localTime";
import { BrutalDateTimePicker } from "./BrutalDateTimePicker";
import { useHydrated } from "@/hooks/useHydrated";

const TYPES: { key: DurationType; label: string; max: number }[] = [
  { key: "seconds", label: "Secs", max: 86400 },
  { key: "minutes", label: "Mins", max: 525600 },
  { key: "hours", label: "Hours", max: 8760 },
  { key: "days", label: "Days", max: 36500 },
];

type Mode = "duration" | "target";

export function CreateCountdownForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("duration");
  const [title, setTitle] = useState("");
  const [durationType, setDurationType] = useState<DurationType>("days");
  const [value, setValue] = useState("7");
  const [targetInput, setTargetInput] = useState("");
  const [colorTag, setColorTag] = useState<string>(PALETTE.teal);
  const [error, setError] = useState<string | null>(null);

  // The viewer's clock and locale are unknown during SSR, so anything derived
  // from them waits for hydration.
  const hydrated = useHydrated();
  useEffect(() => {
    setTargetInput((prev) => prev || localInputValue(Date.now() + 3600_000));
  }, []);

  const activeType = TYPES.find((t) => t.key === durationType)!;
  const targetPreview = targetInput ? spanFromNow(targetInput) : null;
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
      await countdownsRepo.create({ mode: "target", title, targetAt, colorTag });
    } else {
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) {
        setError("That's not a number we can count down from.");
        return;
      }
      const problem = validateSeconds(toSeconds(durationType, num));
      if (problem) {
        setError(problem);
        return;
      }
      await countdownsRepo.create({ title, durationType, durationValue: num, colorTag });
    }

    playSound("start");
    void navigate({ to: "/" });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Left column: the basics */}
      <div className="brut bg-card p-4 sm:p-6">
        <span className="mb-2 block text-xs font-bold uppercase">How do we count?</span>
        <div className="mb-6 grid grid-cols-2 gap-2">
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
          className="brut-thin mb-6 w-full bg-cream px-3 py-3 font-bold outline-none focus:ring-4 focus:ring-primary"
        />

        <span className="mb-2 block text-xs font-bold uppercase">Colour tag</span>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Right column: how long */}
      <div className="brut bg-card p-4 sm:p-6">
        {mode === "target" ? (
          <>
            <span className="mb-2 block text-xs font-bold uppercase">
              End it at (your local time)
            </span>
            {targetInput ? (
              <BrutalDateTimePicker
                value={targetInput}
                onChange={(next) => {
                  setTargetInput(next);
                  setError(null);
                }}
              />
            ) : (
              <div className="brut-thin h-[420px] bg-card" aria-hidden />
            )}
            <p className="mt-3 text-sm font-bold text-muted-foreground">
              {targetPreview ?? "Pick a date and time."}
            </p>
          </>
        ) : (
          <>
            <span className="mb-2 block text-xs font-bold uppercase">Duration type</span>
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setDurationType(t.key)}
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
              className="tick-numerals brut-thin w-full bg-cream px-3 py-3 text-2xl outline-none focus:ring-4 focus:ring-primary"
            />
            <p className="mt-3 text-sm font-bold text-muted-foreground">
              {durationPreview ? `Lands on ${durationPreview}.` : "Pick a number above zero."}
            </p>
          </>
        )}
      </div>

      <div className="lg:col-span-2">
        {error && (
          <p
            className="brut-thin mb-4 px-3 py-2 text-sm font-bold uppercase"
            style={{ backgroundColor: PALETTE.red, color: PALETTE.cream }}
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          className="brut brut-press w-full rounded-none bg-primary px-4 py-4 text-lg font-bold text-primary-foreground uppercase"
        >
          Start the clock
        </button>
      </div>
    </form>
  );
}
