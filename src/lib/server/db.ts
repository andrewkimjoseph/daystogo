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

async function ensureUserRecord(db: AuthedDb, userId: string) {
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
