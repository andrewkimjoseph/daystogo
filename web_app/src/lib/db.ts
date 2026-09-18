import Dexie, { type Table } from "dexie";
import type { CountdownCategory } from "./categories";

export type CountdownStatus = "running" | "lapsed";
/** Absent / `"none"` on older rows means the clock does not repeat. */
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

/**
 * Flat, SQL-friendly shape. Keep it portable: no nested objects, no Dexie-only
 * types — this maps 1:1 to the Postgres `countdowns` table.
 */
export interface Countdown {
  id: string;
  title: string;
  /** Epoch ms the user picked as the landing moment. */
  targetAt: number;
  startedAt: number;
  endsAt: number;
  status: CountdownStatus;
  colorTag: string;
  /** Absent on rows created before categories existed — treat as "other". */
  category?: CountdownCategory | undefined;
  hasCelebrated: boolean;
  /** Epoch ms the user archived this row; undefined means it's still on the board. */
  archivedAt?: number | undefined;
  /** Absent on rows created before recurrence existed — treat as `"none"`. */
  recurrence?: Recurrence | undefined;
  createdAt: number;
  updatedAt: number;
}

/** Singleton row recording the last successful Dexie/Neon sync for this browser. */
export interface SyncMeta {
  id: "sync";
  userId: string;
  lastSyncedAt: number;
}

/** Local log of ids dropped from this browser so a later merge can delete them in Neon. */
export interface DeletedId {
  id: string;
  deletedAt: number;
}

class DaysToGoDB extends Dexie {
  countdowns!: Table<Countdown, string>;
  syncMeta!: Table<SyncMeta, string>;
  deletedIds!: Table<DeletedId, string>;

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
    this.version(6).stores({
      countdowns: "id, status, endsAt, createdAt, targetAt, category, archivedAt",
      syncMeta: "id",
      deletedIds: "id",
    });
    this.version(7)
      .stores({
        countdowns: "id, status, endsAt, createdAt, targetAt, category, archivedAt",
        syncMeta: "id",
        deletedIds: "id",
      })
      .upgrade(async (tx) => {
        const now = Date.now();
        const table = tx.table("countdowns");
        const rows = await table.toArray();
        if (rows.length === 0) return;

        type LegacyRow = Omit<Countdown, "status" | "targetAt"> & {
          status: string;
          targetAt?: number;
          pausedRemainingMs?: number;
          mode?: string;
          durationType?: string;
          durationValue?: number;
          durationSeconds?: number;
        };

        const next = rows.map((raw) => {
          const row: LegacyRow = { ...(raw as LegacyRow) };
          if (row.status === "paused") {
            const remaining = Number(row.pausedRemainingMs);
            row.status = "running";
            row.endsAt = now + Math.max(0, Number.isFinite(remaining) ? remaining : 0);
          }
          if (row.targetAt == null) row.targetAt = row.endsAt;
          delete row.pausedRemainingMs;
          delete row.mode;
          delete row.durationType;
          delete row.durationValue;
          delete row.durationSeconds;
          return row;
        });
        await table.bulkPut(next);
      });
  }
}

let instance: DaysToGoDB | null = null;

/** Lazy so SSR never touches IndexedDB at module scope. */
export function getDb(): DaysToGoDB {
  if (!instance) instance = new DaysToGoDB();
  return instance;
}
