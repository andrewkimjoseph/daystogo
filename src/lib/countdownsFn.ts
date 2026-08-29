import { desc, eq, isNotNull, isNull } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import type { Countdown, CountdownMode, CountdownStatus, DurationType } from "@/lib/db";
import type { CountdownCategory } from "@/lib/categories";
import { rollbackColorTag } from "@/lib/palette";
import { getAuthedDb, runWithClaims } from "./server/db";
import { countdowns, type CountdownRow } from "./server/schema";

function n(value: number | string | null | undefined): number | undefined {
  if (value == null) return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function fromRow(row: CountdownRow): Countdown {
  return {
    id: row.id,
    title: row.title,
    mode: (row.mode as CountdownMode | null) ?? undefined,
    targetAt: n(row.targetAt),
    durationType: row.durationType as DurationType,
    durationValue: row.durationValue,
    durationSeconds: row.durationSeconds,
    startedAt: n(row.startedAt) ?? 0,
    endsAt: n(row.endsAt) ?? 0,
    status: row.status as CountdownStatus,
    pausedRemainingMs: n(row.pausedRemainingMs),
    colorTag: row.colorTag,
    category: (row.category as CountdownCategory | null) ?? undefined,
    hasCelebrated: row.hasCelebrated,
    archivedAt: n(row.archivedAt),
    createdAt: n(row.createdAt) ?? 0,
    updatedAt: n(row.updatedAt) ?? 0,
  };
}

function toInsert(row: Countdown, userId: string) {
  return {
    id: row.id,
    userId,
    title: row.title,
    mode: row.mode ?? null,
    targetAt: row.targetAt ?? null,
    durationType: row.durationType,
    durationValue: row.durationValue,
    durationSeconds: row.durationSeconds,
    startedAt: row.startedAt,
    endsAt: row.endsAt,
    status: row.status,
    pausedRemainingMs: row.pausedRemainingMs ?? null,
    colorTag: row.colorTag,
    category: row.category ?? "other",
    hasCelebrated: row.hasCelebrated,
    archivedAt: row.archivedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const listCountdownsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db, userId } = await getAuthedDb();
  const rows = await runWithClaims<CountdownRow[]>(
    db,
    userId,
    db.select().from(countdowns).where(isNull(countdowns.archivedAt)).orderBy(countdowns.endsAt),
  );
  return rows.map(fromRow);
});

export const listArchivedCountdownsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db, userId } = await getAuthedDb();
  const rows = await runWithClaims<CountdownRow[]>(
    db,
    userId,
    db.select().from(countdowns).where(isNotNull(countdowns.archivedAt)).orderBy(desc(countdowns.archivedAt)),
  );
  return rows.map(fromRow);
});

export const createCountdownFn = createServerFn({ method: "POST" })
  .validator((data: Countdown) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    const rows = await runWithClaims<CountdownRow[]>(
      db,
      userId,
      db.insert(countdowns).values(toInsert(data, userId)).returning(),
    );
    const row = rows[0];
    if (!row) throw new Error("Failed to create countdown");
    return fromRow(row);
  });

export const updateTagsFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; title?: string; colorTag?: string; category?: CountdownCategory }) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    const patch: Partial<typeof countdowns.$inferInsert> = { updatedAt: Date.now() };
    if (data.title !== undefined) patch.title = data.title;
    if (data.colorTag !== undefined) patch.colorTag = data.colorTag;
    if (data.category !== undefined) patch.category = data.category;
    await runWithClaims(db, userId, db.update(countdowns).set(patch).where(eq(countdowns.id, data.id)));
  });

export const archiveCountdownFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    const now = Date.now();
    await runWithClaims(
      db,
      userId,
      db.update(countdowns).set({ archivedAt: now, updatedAt: now }).where(eq(countdowns.id, data.id)),
    );
  });

export const unarchiveCountdownFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    await runWithClaims(
      db,
      userId,
      db
        .update(countdowns)
        .set({ archivedAt: null, updatedAt: Date.now() })
        .where(eq(countdowns.id, data.id)),
    );
  });

export const markLapsedFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    await runWithClaims(
      db,
      userId,
      db
        .update(countdowns)
        .set({ status: "lapsed", updatedAt: Date.now() })
        .where(eq(countdowns.id, data.id)),
    );
  });

export const markCelebratedFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    await runWithClaims(
      db,
      userId,
      db
        .update(countdowns)
        .set({ hasCelebrated: true, updatedAt: Date.now() })
        .where(eq(countdowns.id, data.id)),
    );
  });

export const removeCountdownFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    await runWithClaims(db, userId, db.delete(countdowns).where(eq(countdowns.id, data.id)));
  });

export const importLocalCountdownsFn = createServerFn({ method: "POST" })
  .validator((data: Countdown[]) => data)
  .handler(async ({ data }) => {
    const { db, userId } = await getAuthedDb();
    if (data.length === 0) return { imported: 0 };
    await runWithClaims(
      db,
      userId,
      db
        .insert(countdowns)
        .values(data.map((row) => toInsert(row, userId)))
        .onConflictDoNothing({ target: countdowns.id }),
    );
    return { imported: data.length };
  });

export const reconcileCountdownsFn = createServerFn({ method: "POST" }).handler(async () => {
  const { db, userId } = await getAuthedDb();
  const now = Date.now();
  const rows = await runWithClaims<CountdownRow[]>(db, userId, db.select().from(countdowns));

  for (const row of rows) {
    const mapped = fromRow(row);
    const colorTag = rollbackColorTag(mapped.colorTag);
    let next = mapped;
    let dirty = false;

    if (colorTag !== mapped.colorTag) {
      next = { ...next, colorTag, updatedAt: now };
      dirty = true;
    }

    if (next.status === "paused") {
      next = {
        ...next,
        status: "running",
        endsAt: now + Math.max(0, next.pausedRemainingMs ?? 0),
        pausedRemainingMs: undefined,
        updatedAt: now,
      };
      dirty = true;
    }

    if (next.status === "running" && next.endsAt <= now) {
      next = { ...next, status: "lapsed", updatedAt: now };
      dirty = true;
    }

    if (!dirty) continue;

    await runWithClaims(
      db,
      userId,
      db
        .update(countdowns)
        .set({
          colorTag: next.colorTag,
          status: next.status,
          endsAt: next.endsAt,
          pausedRemainingMs: next.pausedRemainingMs ?? null,
          updatedAt: next.updatedAt,
        })
        .where(eq(countdowns.id, next.id)),
    );
  }
});
