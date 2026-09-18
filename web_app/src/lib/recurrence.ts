import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import type { Countdown, Recurrence } from "./db";

export type { Recurrence };

export const RECURRENCE_OPTIONS: { key: Recurrence; label: string; hint: string }[] = [
  { key: "none", label: "Does not repeat", hint: "One landing, then it stays at zero." },
  { key: "daily", label: "Daily", hint: "Same local time, every day." },
  { key: "weekly", label: "Weekly", hint: "Same weekday and time, every week." },
  { key: "monthly", label: "Monthly", hint: "Same time next month — short months clamp to the last day." },
  { key: "yearly", label: "Yearly", hint: "Same date and time, every year. Feb 29 lands on Feb 28 in non-leap years." },
];

export function isRecurring(c: Pick<Countdown, "recurrence">): boolean {
  return (
    c.recurrence === "daily" ||
    c.recurrence === "weekly" ||
    c.recurrence === "monthly" ||
    c.recurrence === "yearly"
  );
}

export function recurrenceLabel(recurrence: Recurrence | undefined): string | null {
  if (recurrence === "daily") return "Repeats daily";
  if (recurrence === "weekly") return "Repeats weekly";
  if (recurrence === "monthly") return "Repeats monthly";
  if (recurrence === "yearly") return "Repeats yearly";
  return null;
}

export function recurrenceBadgeLabel(recurrence: Recurrence | undefined): string | null {
  const option = RECURRENCE_OPTIONS.find((o) => o.key === recurrence);
  return option ? option.label.toUpperCase() : null;
}

function step(fromMs: number, recurrence: Recurrence): number {
  const from = new Date(fromMs);
  if (recurrence === "daily") return addDays(from, 1).getTime();
  if (recurrence === "weekly") return addWeeks(from, 1).getTime();
  if (recurrence === "monthly") return addMonths(from, 1).getTime();
  if (recurrence === "yearly") return addYears(from, 1).getTime();
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
  if (
    recurrence !== "daily" &&
    recurrence !== "weekly" &&
    recurrence !== "monthly" &&
    recurrence !== "yearly"
  ) {
    return null;
  }

  if (c.endsAt > now) return null;

  const fromMs = c.targetAt ?? c.endsAt;
  const nextAt = nextOccurrence(fromMs, recurrence, now);

  return {
    ...c,
    targetAt: nextAt,
    startedAt: now,
    endsAt: nextAt,
    status: "running",
    hasCelebrated: false,
    updatedAt: now,
  };
}
