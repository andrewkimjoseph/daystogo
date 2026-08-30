import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { eq, sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { users } from "./schema";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export type AuthedDb = NeonHttpDatabase<typeof schema>;

function rethrowDbError(error: unknown, context: string): never {
  const parts = [context];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    if (current instanceof Error && current.message) parts.push(current.message);
    const pg = current as { code?: unknown; detail?: unknown; hint?: unknown; cause?: unknown; sourceError?: unknown };
    if (typeof pg.code === "string") parts.push(`code=${pg.code}`);
    if (typeof pg.detail === "string") parts.push(pg.detail);
    if (typeof pg.hint === "string") parts.push(pg.hint);
    current = pg.cause ?? pg.sourceError;
  }

  const wrapped = new Error(parts.join(" | "));
  wrapped.cause = error;
  console.error(wrapped);
  throw wrapped;
}

type Batchable = Parameters<AuthedDb["batch"]>[0][number];

/**
 * Runs a Drizzle query under Neon RLS without depending on Neon's external
 * JWKS provider registration. Clerk's own middleware has already verified
 * the caller before this ever runs, so we set `request.jwt.claims` ourselves
 * in the same batch as the query — this is Neon's documented
 * "JWT self-verification" pattern, adapted to use Drizzle's own `db.batch()`
 * (instead of the raw driver's `sql.transaction()`) so results still get
 * Drizzle's normal camelCase/type mapping applied:
 * https://neon.com/docs/serverless/serverless-driver#using-transactions-with-jwt-self-verification
 */
export async function runWithClaims<T>(db: AuthedDb, userId: string, query: Batchable): Promise<T> {
  const claims = JSON.stringify({ sub: userId, role: "authenticated" });
  const [, result] = await db.batch([db.execute(sql`select set_config('request.jwt.claims', ${claims}, true)`), query]);
  return result as T;
}

/** Same claims transaction as `runWithClaims`, but many queries in one HTTP batch. */
export async function runWithClaimsMany(db: AuthedDb, userId: string, queries: Batchable[]): Promise<unknown[]> {
  if (queries.length === 0) return [];
  const claims = JSON.stringify({ sub: userId, role: "authenticated" });
  const [, ...results] = await db.batch([
    db.execute(sql`select set_config('request.jwt.claims', ${claims}, true)`),
    ...queries,
  ] as [Batchable, ...Batchable[]]);
  return results;
}

async function ensureUserRecord(db: AuthedDb, userId: string) {
  try {
    const existing = await runWithClaims<{ id: string }[]>(
      db,
      userId,
      db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1),
    );
    if (existing[0]) return;

    const clerkUser = await clerkClient().users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Clerk user has no email address");

    const name = clerkUser.fullName?.trim() || clerkUser.username || null;
    const now = Date.now();

    await runWithClaims(
      db,
      userId,
      db
        .insert(users)
        .values({
          id: userId,
          email,
          name,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: users.id }),
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    rethrowDbError(error, "Failed to ensure user record");
  }
}

export async function getAuthedDb() {
  const session = await auth();
  const userId = session.userId;
  if (!userId) throw new UnauthorizedError();

  const url = process.env["DATABASE_AUTHENTICATED_URL"];
  if (!url) throw new Error("Missing DATABASE_AUTHENTICATED_URL");

  const sqlClient = neon(url);
  const db = drizzle(sqlClient, { schema });

  try {
    await ensureUserRecord(db, userId);
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    rethrowDbError(error, "Failed to ensure user record");
  }

  return { db, userId };
}
