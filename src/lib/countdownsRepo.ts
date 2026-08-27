import { getDb, type Countdown, type DurationType } from "./db";
import type { CountdownCategory } from "./categories";
import { rollbackColorTag } from "./palette";

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
  category?: CountdownCategory;
}

export interface NewTargetInput {
  mode: "target";
  title: string;
  /** Epoch ms of the exact local moment the countdown should lapse. */
  targetAt: number;
  colorTag: string;
  category?: CountdownCategory;
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
  /** Active board: archived rows are excluded. */
  async all(): Promise<Countdown[]> {
    const rows = await getDb().countdowns.orderBy("endsAt").toArray();
    return rows.filter((c) => c.archivedAt === undefined);
  },

  /** Archived rows, most recently archived first. */
  async archived(): Promise<Countdown[]> {
    const rows = await getDb().countdowns.toArray();
    return rows
      .filter((c) => c.archivedAt !== undefined)
      .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
  },

  async archive(id: string): Promise<void> {
    const now = Date.now();
    await getDb().countdowns.update(id, { archivedAt: now, updatedAt: now });
  },

  async unarchive(id: string): Promise<void> {
    await getDb().countdowns.update(id, { archivedAt: undefined, updatedAt: Date.now() });
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
      // Target mode lands on the exact chosen moment; rounding durationSeconds must not shave ms off it.
      endsAt: isTarget ? input.targetAt : now + durationSeconds * 1000,
      status: "running",
      colorTag: input.colorTag,
      category: input.category ?? "other",
      hasCelebrated: false,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().countdowns.add(row);
    return row;
  },

  /** Only the cosmetic fields are editable once a clock is running. */
  async updateTags(
    id: string,
    patch: { title?: string; colorTag?: string; category?: CountdownCategory },
  ): Promise<void> {
    await getDb().countdowns.update(id, { ...patch, updatedAt: Date.now() });
  },


  async markLapsed(id: string): Promise<void> {
    await getDb().countdowns.update(id, { status: "lapsed", updatedAt: Date.now() });
  },

  async markCelebrated(id: string): Promise<void> {
    await getDb().countdowns.update(id, { hasCelebrated: true, updatedAt: Date.now() });
  },




  async remove(id: string): Promise<void> {
    await getDb().countdowns.delete(id);
  },

  /**
   * Never trust a stale `status`: reconcile against the wall clock on load.
   * Legacy paused rows resume where they left off — pausing is no longer offered.
   */
  async reconcile(): Promise<void> {
    const db = getDb();
    const now = Date.now();
    const rows = await db.countdowns.toArray();
    const byId = new Map<string, Countdown>();

    for (const c of rows) {
      const colorTag = rollbackColorTag(c.colorTag);
      if (colorTag !== c.colorTag) {
        byId.set(c.id, { ...c, colorTag, updatedAt: now });
      }
    }

    const get = (c: Countdown) => byId.get(c.id) ?? c;

    const patched = rows
      .filter((c) => c.status === "paused")
      .map((c) => {
        const base = get(c);
        return {
          ...base,
          status: "running" as const,
          endsAt: now + Math.max(0, base.pausedRemainingMs ?? 0),
          pausedRemainingMs: undefined,
          updatedAt: now,
        };
      });
    const due = [...patched, ...rows.filter((c) => c.status === "running").map(get)]
      .filter((c) => c.endsAt <= now)
      .map((c) => ({ ...c, status: "lapsed" as const, updatedAt: now }));

    for (const c of [...patched, ...due]) byId.set(c.id, c);

    if (byId.size === 0) return;
    await db.countdowns.bulkPut([...byId.values()]);
  },
};
