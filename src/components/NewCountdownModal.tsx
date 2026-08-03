import { useState } from "react";
import { X } from "lucide-react";
import type { DurationType } from "@/lib/db";
import { countdownsRepo, toSeconds, validateSeconds } from "@/lib/countdownsRepo";
import { COLOR_TAGS, PALETTE, tagTextColor } from "@/lib/palette";
import { playSound } from "@/lib/soundManager";
import { localInputValue, spanFromNow } from "@/lib/localTime";

const TYPES: { key: DurationType; label: string; max: number }[] = [
  { key: "seconds", label: "Secs", max: 86400 },
  { key: "minutes", label: "Mins", max: 525600 },
  { key: "hours", label: "Hours", max: 8760 },
  { key: "days", label: "Days", max: 365 },
];

type Mode = "duration" | "target";

export function NewCountdownModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<Mode>("duration");
  const [title, setTitle] = useState("");
  const [durationType, setDurationType] = useState<DurationType>("days");
  const [value, setValue] = useState("7");
  const [targetInput, setTargetInput] = useState(() => localInputValue(Date.now() + 3600_000));
  const [colorTag, setColorTag] = useState<string>(PALETTE.teal);
  const [error, setError] = useState<string | null>(null);

  const activeType = TYPES.find((t) => t.key === durationType)!;
  const targetPreview = spanFromNow(targetInput);

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
    onCreated();
    onClose();
  }


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{ backgroundColor: "color-mix(in oklab, var(--ink) 60%, transparent)" }}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="brut animate-slide-up w-full max-w-lg bg-cream p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-2xl uppercase">New countdown</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="brut-thin brut-press flex h-9 w-9 items-center justify-center rounded-none bg-card"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
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
          className="brut-thin mb-5 w-full bg-card px-3 py-2.5 font-bold outline-none focus:ring-4 focus:ring-primary"
        />

        <span className="mb-2 block text-xs font-bold uppercase">Duration type</span>
        <div className="mb-5 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setDurationType(t.key)}
              className="brut-thin brut-press rounded-none px-4 py-2 text-sm font-bold uppercase"
              style={
                durationType === t.key
                  ? { backgroundColor: PALETTE.teal, color: PALETTE.cream }
                  : { backgroundColor: "var(--card)" }
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
          onChange={(e) => setValue(e.target.value)}
          className="tick-numerals brut-thin mb-5 w-full bg-card px-3 py-2.5 text-2xl outline-none focus:ring-4 focus:ring-primary"
        />

        <span className="mb-2 block text-xs font-bold uppercase">Colour tag</span>
        <div className="mb-5 flex flex-wrap gap-2">
          {COLOR_TAGS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColorTag(c.hex)}
              aria-label={c.label}
              aria-pressed={colorTag === c.hex}
              className="brut-thin brut-press h-10 w-10 rounded-none"
              style={{
                backgroundColor: c.hex,
                boxShadow: colorTag === c.hex ? "0 0 0 4px var(--ink) inset" : undefined,
                color: tagTextColor(c.hex),
              }}
            />
          ))}
        </div>

        {error && (
          <p
            className="brut-thin mb-5 px-3 py-2 text-sm font-bold uppercase"
            style={{ backgroundColor: PALETTE.red, color: PALETTE.cream }}
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="brut-thin brut-press w-full rounded-none bg-primary px-4 py-3 text-lg font-bold text-primary-foreground uppercase"
        >
          Start the clock
        </button>
      </form>
    </div>
  );
}
