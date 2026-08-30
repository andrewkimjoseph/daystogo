import { getDb, type Countdown, type DurationType } from "./db";
import type { CountdownCategory } from "./categories";
import { countdownsLocal } from "./countdownsLocal";
import { isCloudSync, shouldSkipCloudReconcile } from "./syncMode";
import {
  archiveCountdownFn,
  createCountdownFn,
  importLocalCountdownsFn,
  listAllCountdownsFn,
  listArchivedCountdownsFn,
  listCountdownsFn,
  markCelebratedFn,
  markLapsedFn,
  reconcileCountdownsFn,
  removeCountdownFn,
  unarchiveCountdownFn,
  updateTagsFn,
} from "./countdownsFn";

export const COUNTDOWNS_QUERY_KEY = ["countdowns"] as const;

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
  if (seconds > MAX_DURATION_SECONDS)
    return "Forever isn’t a thing — pick something this side of the next century.";
  return null;
}

/** Dexie follow-up after a successful Neon write — never roll back the cloud. */
async function mirrorLocal(work: () => Promise<unknown>): Promise<void> {
  try {
    await work();
  } catch (error) {
    console.error(error);
  }
}

async function pullCloudIntoDexie(): Promise<void> {
  const rows = await listAllCountdownsFn();
  await mirrorLocal(() => countdownsLocal.replaceAll(rows));
}

export const countdownsRepo = {
  /** Active board: archived rows are excluded. */
  async all(): Promise<Countdown[]> {
    return isCloudSync() ? listCountdownsFn() : countdownsLocal.all();
  },

  /** Archived rows, most recently archived first. */
  async archived(): Promise<Countdown[]> {
    return isCloudSync() ? listArchivedCountdownsFn() : countdownsLocal.archived();
  },

  async archive(id: string): Promise<void> {
    if (isCloudSync()) {
      await archiveCountdownFn({ data: { id } });
      await mirrorLocal(() => countdownsLocal.archive(id));
      return;
    }
    await countdownsLocal.archive(id);
  },

  async unarchive(id: string): Promise<void> {
    if (isCloudSync()) {
      await unarchiveCountdownFn({ data: { id } });
      await mirrorLocal(() => countdownsLocal.unarchive(id));
      return;
    }
    await countdownsLocal.unarchive(id);
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
    if (isCloudSync()) {
      const saved = await createCountdownFn({ data: row });
      await mirrorLocal(() => countdownsLocal.put(saved));
      return saved;
    }
    return countdownsLocal.add(row);
  },

  /** Only the cosmetic fields are editable once a clock is running. */
  async updateTags(
    id: string,
    patch: { title?: string; colorTag?: string; category?: CountdownCategory },
  ): Promise<void> {
    if (isCloudSync()) {
      await updateTagsFn({ data: { id, ...patch } });
      await mirrorLocal(() => countdownsLocal.updateTags(id, patch));
      return;
    }
    await countdownsLocal.updateTags(id, patch);
  },

  async markLapsed(id: string): Promise<void> {
    if (isCloudSync()) {
      await markLapsedFn({ data: { id } });
      await mirrorLocal(() => countdownsLocal.markLapsed(id));
      return;
    }
    await countdownsLocal.markLapsed(id);
  },

  async markCelebrated(id: string): Promise<void> {
    if (isCloudSync()) {
      await markCelebratedFn({ data: { id } });
      await mirrorLocal(() => countdownsLocal.markCelebrated(id));
      return;
    }
    await countdownsLocal.markCelebrated(id);
  },

  async remove(id: string): Promise<void> {
    if (isCloudSync()) {
      await removeCountdownFn({ data: { id } });
      await mirrorLocal(() => countdownsLocal.remove(id));
      return;
    }
    await countdownsLocal.remove(id);
  },

  async importLocal(rows: Countdown[]): Promise<void> {
    if (rows.length === 0) return;
    await importLocalCountdownsFn({ data: rows });
  },

  /**
   * Signed-in boot: push this browser's Dexie rows into Neon, then reconcile
   * and replace Dexie with the cloud set so both stores match.
   */
  async sync(): Promise<void> {
    const rows = await getDb().countdowns.toArray();
    if (rows.length > 0) await importLocalCountdownsFn({ data: rows });
    await reconcileCountdownsFn();
    await pullCloudIntoDexie();
  },

  /**
   * Never trust a stale `status`: reconcile against the wall clock on load.
   * Legacy paused rows resume where they left off — pausing is no longer offered.
   * When signed in, Neon is reconciled then Dexie is replaced from the cloud.
   */
  async reconcile(): Promise<void> {
    if (isCloudSync()) {
      if (shouldSkipCloudReconcile()) return;
      await reconcileCountdownsFn();
      await pullCloudIntoDexie();
      return;
    }
    await countdownsLocal.reconcile();
  },
};
