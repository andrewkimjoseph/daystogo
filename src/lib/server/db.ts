import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { eq } from "drizzle-orm";
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

type AuthedDb = NeonHttpDatabase<typeof schema>;

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

async function ensureUserRecord(db: AuthedDb, userId: string) {
  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (existing) return;

    const clerkUser = await clerkClient().users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Clerk user has no email address");

    const name = clerkUser.fullName?.trim() || clerkUser.username || null;
    const now = Date.now();

    await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: users.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    rethrowDbError(error, "Failed to ensure user record");
  }
}

export async function getAuthedDb() {
  const session = await auth();
  const userId = session.userId;
  if (!userId) throw new UnauthorizedError();

  const token = await session.getToken();
  if (!token) throw new UnauthorizedError();

  const url = process.env["DATABASE_AUTHENTICATED_URL"];
  if (!url) throw new Error("Missing DATABASE_AUTHENTICATED_URL");

  const sql = neon(url, { authToken: token });
  const db = drizzle(sql, { schema });
  await ensureUserRecord(db, userId);
  return { db, userId };
}
