/** Local-time helpers for the "end time" countdown mode. No timezone library. */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Epoch ms -> `YYYY-MM-DDTHH:mm` in the viewer's local time, for datetime-local. */
export function localInputValue(ms: number): string {
  const d = new Date(ms);
  d.setSeconds(0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Human blurb for how far a datetime-local value is from now, or null if unusable. */
export function spanFromNow(inputValue: string): string | null {
  const target = new Date(inputValue).getTime();
  if (!Number.isFinite(target)) return null;
  let seconds = Math.round((target - Date.now()) / 1000);
  if (seconds <= 0) return "That moment is already in the past.";

  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (parts.length === 0) parts.push("under a minute");

  return `That's ${parts.slice(0, 2).join(", ")} from now.`;
}

/** Short local label for a card, e.g. "Mon 3 Aug, 18:30" (adds year if not this year). */
export function formatTargetLabel(ms: number): string {
  const target = new Date(ms);
  const sameYear = target.getFullYear() === new Date().getFullYear();
  return target.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  });
}
