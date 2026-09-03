import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { COUNTDOWNS_QUERY_KEY, countdownsRepo, validateSeconds } from "@/lib/countdownsRepo";
import { COLOR_TAGS, PALETTE, tagTextColor } from "@/lib/palette";
import { CATEGORIES, type CountdownCategory } from "@/lib/categories";
import { playSound } from "@/lib/soundManager";
import { localInputValue, spanFromNow } from "@/lib/localTime";
import { BrutalCalendar, BrutalTimeField } from "./BrutalDateTimePicker";
import { useHydrated } from "@/hooks/useHydrated";

/** `YYYY-MM-DD` -> local start of that day, or null when unusable. */
function parseDayParam(raw: string | undefined): Date | null {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 9, 0, 0, 0);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** Default end time: seeded day at 09:00 local, or an hour from now. */
function seedTargetInput(initialDate?: string): string {
  const seededDay = parseDayParam(initialDate);
  const soon = Date.now() + 3600_000;
  const seeded = seededDay && seededDay.getTime() > Date.now() ? seededDay.getTime() : soon;
  return localInputValue(seeded);
}

function PickerSkeleton() {
  return <div className="brut-thin h-[520px] bg-card sm:h-[620px]" aria-hidden />;
}

/**
 * Date/time picker — only mounted after hydration so the server HTML and the
 * first client render stay byte-identical (skeleton only).
 */
function HydratedDateTimePicker({
  initialDate,
  onTargetChange,
  onClearError,
}: {
  initialDate?: string | undefined;
  onTargetChange: (value: string) => void;
  onClearError: () => void;
}) {
  const [targetInput, setTargetInput] = useState(() => seedTargetInput(initialDate));

  useLayoutEffect(() => {
    onTargetChange(targetInput);
  }, [onTargetChange, targetInput]);

  useEffect(() => {
    setTargetInput(seedTargetInput(initialDate));
  }, [initialDate]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const targetPreview = spanFromNow(targetInput);

  function handleChange(next: string) {
    setTargetInput(next);
    onTargetChange(next);
    onClearError();
  }

  return (
    <>
      <BrutalCalendar value={targetInput} onChange={handleChange} />
      <span className="mt-6 mb-2 block text-xs font-bold uppercase">Time (type it or tap)</span>
      <BrutalTimeField value={targetInput} onChange={handleChange} />
      <p className="mt-3 text-sm font-bold text-muted-foreground">
        {targetPreview ?? "Pick a date and time."}
      </p>
    </>
  );
}

export function CreateCountdownForm({ initialDate }: { initialDate?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const [title, setTitle] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [colorTag, setColorTag] = useState<string>(PALETTE.teal);
  const [category, setCategory] = useState<CountdownCategory>("other");
  const [error, setError] = useState<string | null>(null);

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Every countdown needs a name. Go on.");
      return;
    }

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
    await queryClient.invalidateQueries({ queryKey: COUNTDOWNS_QUERY_KEY });

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
            Pick the exact moment it should land. It starts ticking the second you hit go.
          </p>
        </div>
        <div className="hidden flex-col gap-2 sm:flex sm:items-end">
          <SubmitBlock error={error} />
        </div>
      </div>

      {/* Left column: the basics */}

      <div className="brut h-full bg-card p-4 sm:p-6">
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
                <Icon className="h-4 w-4 shrink-0" strokeWidth={3} />
                <span className="min-w-0 break-words">
                  <span aria-hidden>{c.emoji}</span> {c.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm font-bold text-muted-foreground">{activeCategory.hint}</p>
      </div>

      {/* Right column: when it lands */}
      <div className="brut h-full bg-card p-4 sm:p-6">
        <span className="mb-2 block text-xs font-bold uppercase">End it at (your local time)</span>
        {hydrated ? (
          <HydratedDateTimePicker
            initialDate={initialDate}
            onTargetChange={setTargetInput}
            onClearError={() => setError(null)}
          />
        ) : (
          <PickerSkeleton />
        )}
      </div>

      {/* Mobile: the submit button lives at the bottom of the flow */}
      <div className="flex flex-col gap-2 sm:hidden">
        <SubmitBlock error={error} />
      </div>
    </form>
  );
}

function SubmitBlock({ error }: { error: string | null }) {
  return (
    <>
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
    </>
  );
}
