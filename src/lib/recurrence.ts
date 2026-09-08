import { addDays, addMonths, addWeeks } from "date-fns";
import type { Countdown, DurationType, Recurrence } from "./db";

export type { Recurrence };

export const RECURRENCE_OPTIONS: { key: Recurrence; label: string; hint: string }[] = [
  { key: "none", label: "Does not repeat", hint: "One landing, then it stays at zero." },
  { key: "daily", label: "Daily", hint: "Same local time, every day." },
  { key: "weekly", label: "Weekly", hint: "Same weekday and time, every week." },
  { key: "monthly", label: "Monthly", hint: "Same time next month — short months clamp to the last day." },
];

export function isRecurring(c: Pick<Countdown, "recurrence">): boolean {
  return c.recurrence === "daily" || c.recurrence === "weekly" || c.recurrence === "monthly";
}

export function recurrenceLabel(recurrence: Recurrence | undefined): string | null {
  if (recurrence === "daily") return "Repeats daily";
  if (recurrence === "weekly") return "Repeats weekly";
  if (recurrence === "monthly") return "Repeats monthly";
  return null;
}

/** Best-fit duration unit/value for a raw span, so restart + labels keep working. */
export function describeSeconds(seconds: number): { type: DurationType; value: number } {
  if (seconds % 86400 === 0) return { type: "days", value: seconds / 86400 };
  if (seconds % 3600 === 0) return { type: "hours", value: seconds / 3600 };
  if (seconds % 60 === 0) return { type: "minutes", value: seconds / 60 };
  return { type: "seconds", value: seconds };
}

function step(fromMs: number, recurrence: Recurrence): number {
  const from = new Date(fromMs);
  if (recurrence === "daily") return addDays(from, 1).getTime();
  if (recurrence === "weekly") return addWeeks(from, 1).getTime();
  if (recurrence === "monthly") return addMonths(from, 1).getTime();
  return fromMs;
}

/** Next landing strictly after `now`, preserving local wall-clock time. */
export function nextOccurrence(fromMs: number, recurrence: Recurrence, now: number): number {
  let next = fromMs;
  for (let i = 0; i < 10_000; i++) {
    next = step(next, recurrence);
    if (next > now) return next;
  }
  return next;
}

/**
 * Advance an overdue recurring clock to the next future landing.
 * Returns null when the row does not repeat.
 */
export function advanceRecurring(c: Countdown, now: number): Countdown | null {
  const recurrence = c.recurrence;
  if (recurrence !== "daily" && recurrence !== "weekly" && recurrence !== "monthly") {
    return null;
  }

  const isTarget = c.mode === "target" || c.targetAt !== undefined;
  if (c.endsAt > now) return null;

  const fromMs = isTarget ? (c.targetAt ?? c.endsAt) : c.endsAt;
  const nextAt = nextOccurrence(fromMs, recurrence, now);
  const durationSeconds = Math.max(1, Math.round((nextAt - now) / 1000));
  const described = describeSeconds(durationSeconds);

  return {
    ...c,
    targetAt: isTarget ? nextAt : c.targetAt,
    durationType: isTarget ? described.type : c.durationType,
    durationValue: isTarget ? described.value : c.durationValue,
    durationSeconds: isTarget ? durationSeconds : c.durationSeconds,
    startedAt: now,
    endsAt: nextAt,
    status: "running",
    hasCelebrated: false,
    updatedAt: now,
  };
}
