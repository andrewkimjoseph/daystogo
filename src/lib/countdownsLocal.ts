import { getDb, type Countdown } from "./db";
import type { CountdownCategory } from "./categories";
import { rollbackColorTag } from "./palette";

export const countdownsLocal = {
  async all(): Promise<Countdown[]> {
    const rows = await getDb().countdowns.orderBy("endsAt").toArray();
    return rows.filter((c) => c.archivedAt === undefined);
  },

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

  async add(row: Countdown): Promise<Countdown> {
    await getDb().countdowns.add(row);
    return row;
  },

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

    // Same two-way status rule as the cloud reconcile: a lapsed row whose
    // end is still in the future was marked by a stale clock — put it back.
    for (const c of rows) {
      const next = byId.get(c.id) ?? c;
      if (next.status === "lapsed" && next.endsAt > now) {
        byId.set(c.id, { ...next, status: "running", hasCelebrated: false, updatedAt: now });
      }
    }

    if (byId.size === 0) return;
    await db.countdowns.bulkPut([...byId.values()]);
  },
};
