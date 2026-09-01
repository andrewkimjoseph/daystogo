export interface Formatted {
  text: string;
  /** true in the final minute — cards go big & dramatic. */
  dramatic: boolean;
  /** Rough width hint (characters) so callers can shrink the type to one line. */
  length: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Calendar-aware breakdown of the gap between two instants.
 * Years/months are counted on the real calendar, so "1mo" means the same
 * day-of-month next month rather than a fixed 30 days.
 */
function calendarParts(from: number, to: number) {
  const start = new Date(from);
  const cursor = new Date(from);

  let years = 0;
  cursor.setFullYear(cursor.getFullYear() + 1);
  while (cursor.getTime() <= to) {
    years += 1;
    cursor.setTime(start.getTime());
    cursor.setFullYear(start.getFullYear() + years + 1);
  }

  const afterYears = new Date(start.getTime());
  afterYears.setFullYear(start.getFullYear() + years);

  let months = 0;
  const probe = new Date(afterYears.getTime());
  probe.setMonth(probe.getMonth() + 1);
  while (probe.getTime() <= to) {
    months += 1;
    probe.setTime(afterYears.getTime());
    probe.setMonth(afterYears.getMonth() + months + 1);
  }

  const anchor = new Date(afterYears.getTime());
  anchor.setMonth(afterYears.getMonth() + months);

  return { years, months, restMs: to - anchor.getTime() };
}

/**
 * @param ms remaining milliseconds
 * @param now optional current timestamp; with `endsAt` it enables years/months
 * @param endsAt optional end timestamp
 */
export function formatRemaining(ms: number, now?: number, endsAt?: number): Formatted {
  const total = Math.max(0, Math.ceil(ms / 1000));
  if (total === 0) return { text: "00:00:00", dramatic: true, length: 8 };

  const done = (text: string, dramatic = false): Formatted => ({
    text,
    dramatic,
    length: text.length,
  });

  if (total < 60) return done(`${pad(0)}:${pad(Math.floor(total / 60))}:${pad(total % 60)}`, true);

  const useCalendar =
    now !== undefined && endsAt !== undefined && endsAt > now && total >= 28 * 86400;

  let days = Math.floor(total / 86400);
  let rest = total % 86400;
  let years = 0;
  let months = 0;

  if (useCalendar) {
    const parts = calendarParts(now, endsAt);
    const restTotal = Math.max(0, Math.ceil(parts.restMs / 1000));
    years = parts.years;
    months = parts.months;
    days = Math.floor(restTotal / 86400);
    rest = restTotal % 86400;
  }

  const clock = `${pad(Math.floor(rest / 3600))}:${pad(Math.floor((rest % 3600) / 60))}:${pad(rest % 60)}`;
  if (total < 86400) return done(clock);

  const head = [
    years > 0 ? `${years}y` : null,
    months > 0 ? `${months}mo` : null,
    days > 0 || (years === 0 && months === 0) ? `${days}d` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return done(`${head} ${clock}`);
}


export function progressPercent(startedAt: number, endsAt: number, remaining: number): number {
  const span = Math.max(1, endsAt - startedAt);
  const done = span - remaining;
  return Math.min(100, Math.max(0, (done / span) * 100));
}
