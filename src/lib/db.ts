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
  hasCelebrated: boolean;
  createdAt: number;
  updatedAt: number;
}

class DaysToGoDB extends Dexie {
  countdowns!: Table<Countdown, string>;

  constructor() {
    super("daystogo");
    this.version(1).stores({
      countdowns: "id, status, endsAt, createdAt",
    });
    this.version(2).stores({
      countdowns: "id, status, endsAt, createdAt, targetAt",
    });
  }
}

let instance: DaysToGoDB | null = null;

/** Lazy so SSR never touches IndexedDB at module scope. */
export function getDb(): DaysToGoDB {
  if (!instance) instance = new DaysToGoDB();
  return instance;
}
