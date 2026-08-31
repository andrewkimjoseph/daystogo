import Dexie, { type Table } from "dexie";
import type { CountdownCategory } from "./categories";

export type DurationType = "seconds" | "minutes" | "hours" | "days";
export type CountdownStatus = "running" | "paused" | "lapsed";
export type CountdownMode = "duration" | "target";

/**
 * Flat, SQL-friendly shape. Keep it portable: no nested objects, no Dexie-only
 * types — this maps 1:1 to a future Prisma/Postgres `countdowns` table.
 */
export interface Countdown {
  id: string;
  title: string;
  /** Absent on rows created before target mode existed — treat as "duration". */
  mode?: CountdownMode | undefined;
  /** Epoch ms the user picked, only for mode === "target". */
  targetAt?: number | undefined;
  durationType: DurationType;
  durationValue: number;
  durationSeconds: number;
  startedAt: number;
  endsAt: number;
  status: CountdownStatus;
  pausedRemainingMs?: number | undefined;
  colorTag: string;
  /** Absent on rows created before categories existed — treat as "other". */
  category?: CountdownCategory | undefined;
  hasCelebrated: boolean;
  /** Epoch ms the user archived this row; undefined means it's still on the board. */
  archivedAt?: number | undefined;
  createdAt: number;
  updatedAt: number;
}

/** Singleton row recording the last successful Dexie/Neon sync for this browser. */
export interface SyncMeta {
  id: "sync";
  userId: string;
  lastSyncedAt: number;
}

class DaysToGoDB extends Dexie {
  countdowns!: Table<Countdown, string>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super("daystogo");
    this.version(1).stores({
      countdowns: "id, status, endsAt, createdAt",
    });
    this.version(2).stores({
      countdowns: "id, status, endsAt, createdAt, targetAt",
    });
    this.version(3).stores({
      countdowns: "id, status, endsAt, createdAt, targetAt, category",
    });
    this.version(4).stores({
      countdowns: "id, status, endsAt, createdAt, targetAt, category, archivedAt",
    });
    this.version(5).stores({
      countdowns: "id, status, endsAt, createdAt, targetAt, category, archivedAt",
      syncMeta: "id",
    });
  }
}

let instance: DaysToGoDB | null = null;

/** Lazy so SSR never touches IndexedDB at module scope. */
export function getDb(): DaysToGoDB {
  if (!instance) instance = new DaysToGoDB();
  return instance;
}
