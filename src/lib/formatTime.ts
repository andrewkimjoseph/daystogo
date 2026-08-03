export interface Formatted {
  text: string;
  /** true in the final minute — cards go big & dramatic. */
  dramatic: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatRemaining(ms: number): Formatted {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (total === 0) return { text: "00:00:00", dramatic: true };
  if (total < 60) return { text: clock, dramatic: true };
  if (days >= 1) return { text: `${days}d ${clock}`, dramatic: false };
  return { text: clock, dramatic: false };
}

export function progressPercent(startedAt: number, endsAt: number, remaining: number): number {
  const span = Math.max(1, endsAt - startedAt);
  const done = span - remaining;
  return Math.min(100, Math.max(0, (done / span) * 100));
}
