export interface Formatted {
  text: string;
  dramatic: boolean;
  length: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

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

  const weeks = Math.floor(days / 7);
  days %= 7;

  const head = [
    years > 0 ? `${years}y` : null,
    months > 0 ? `${months}mo` : null,
    weeks > 0 ? `${weeks}wk` : null,
    days > 0 || (years === 0 && months === 0 && weeks === 0) ? `${days}d` : null,
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

export function formatTargetLabel(ms: number): string {
  const target = new Date(Math.round(ms / 1000) * 1000);
  const sameYear = target.getFullYear() === new Date().getFullYear();
  return target.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
