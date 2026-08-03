import { getDb, type Countdown, type DurationType } from "./db";

export const MIN_DURATION_SECONDS = 3;
/** Sanity bound, not a product limit: ~100 years keeps dates valid. */
export const MAX_DURATION_SECONDS = 100 * 365 * 24 * 60 * 60;

const MULTIPLIER: Record<DurationType, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
};

export function toSeconds(type: DurationType, value: number): number {
  return Math.round(value * MULTIPLIER[type]);
}

export function remainingMs(c: Countdown, now: number): number {
  if (c.status === "paused") return Math.max(0, c.pausedRemainingMs ?? 0);
  return Math.max(0, c.endsAt - now);
}

export interface NewDurationInput {
  mode?: "duration";
  title: string;
  durationType: DurationType;
  durationValue: number;
  colorTag: string;
}

export interface NewTargetInput {
  mode: "target";
  title: string;
  /** Epoch ms of the exact local moment the countdown should lapse. */
  targetAt: number;
  colorTag: string;
}

export type NewCountdownInput = NewDurationInput | NewTargetInput;

/** Best-fit duration unit/value for a raw span, so restart + labels keep working. */
function describeSeconds(seconds: number): { type: DurationType; value: number } {
  if (seconds % 86400 === 0) return { type: "days", value: seconds / 86400 };
  if (seconds % 3600 === 0) return { type: "hours", value: seconds / 3600 };
  if (seconds % 60 === 0) return { type: "minutes", value: seconds / 60 };
  return { type: "seconds", value: seconds };
}

/** Shared validation for both creation modes. Returns null when valid. */
export function validateSeconds(seconds: number): string | null {
  if (!Number.isFinite(seconds)) return "That's not a number we can count down from.";
  if (seconds < MIN_DURATION_SECONDS) return "Give it at least 3 seconds to be a real countdown.";
  if (seconds > MAX_DURATION_SECONDS) return "Forever isn\u2019t a thing \u2014 pick something this side of the next century.";
  return null;
}

export const countdownsRepo = {
  async all(): Promise<Countdown[]> {
    return getDb().countdowns.orderBy("createdAt").reverse().toArray();
  },

  async create(input: NewCountdownInput): Promise<Countdown> {
    const now = Date.now();
    const isTarget = input.mode === "target";
    const durationSeconds = isTarget
      ? Math.max(1, Math.round((input.targetAt - now) / 1000))
      : toSeconds(input.durationType, input.durationValue);
    const described = describeSeconds(durationSeconds);
    const row: Countdown = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      mode: isTarget ? "target" : "duration",
      targetAt: isTarget ? input.targetAt : undefined,
      durationType: isTarget ? described.type : input.durationType,
      durationValue: isTarget ? described.value : input.durationValue,
      durationSeconds,
      startedAt: now,
      endsAt: now + durationSeconds * 1000,
      status: "running",
      colorTag: input.colorTag,
      hasCelebrated: false,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().countdowns.add(row);
    return row;
  },

  async pause(id: string): Promise<void> {
    const db = getDb();
    const c = await db.countdowns.get(id);
    if (!c || c.status !== "running") return;
    const now = Date.now();
    await db.countdowns.update(id, {
      status: "paused",
      pausedRemainingMs: Math.max(0, c.endsAt - now),
      updatedAt: now,
    });
  },

  async resume(id: string): Promise<void> {
    const db = getDb();
    const c = await db.countdowns.get(id);
    if (!c || c.status !== "paused") return;
    const now = Date.now();
    await db.countdowns.update(id, {
      status: "running",
      endsAt: now + (c.pausedRemainingMs ?? 0),
      pausedRemainingMs: undefined,
      updatedAt: now,
    });
  },

  async markLapsed(id: string): Promise<void> {
    await getDb().countdowns.update(id, { status: "lapsed", updatedAt: Date.now() });
  },

  async markCelebrated(id: string): Promise<void> {
    await getDb().countdowns.update(id, { hasCelebrated: true, updatedAt: Date.now() });
  },

  async restart(id: string): Promise<void> {
    const db = getDb();
    const c = await db.countdowns.get(id);
    if (!c) return;
    const now = Date.now();
    await db.countdowns.update(id, {
      status: "running",
      startedAt: now,
      endsAt: now + c.durationSeconds * 1000,
      pausedRemainingMs: undefined,
      hasCelebrated: false,
      updatedAt: now,
    });
  },

  async remove(id: string): Promise<void> {
    await getDb().countdowns.delete(id);
  },

  /** Never trust a stale `status`: reconcile against the wall clock on load. */
  async reconcile(): Promise<void> {
    const db = getDb();
    const now = Date.now();
    const rows = await db.countdowns.toArray();
    const due = rows.filter((c) => c.status === "running" && c.endsAt <= now);
    if (due.length === 0) return;
    await db.countdowns.bulkPut(due.map((c) => ({ ...c, status: "lapsed", updatedAt: now })));
  },
};
