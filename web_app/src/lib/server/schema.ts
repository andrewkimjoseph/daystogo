import { sql } from "drizzle-orm";
import { bigint, boolean, pgTable, text } from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    username: text("username"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.id),
      modify: authUid(table.id),
    }),
  ],
);

export const countdowns = pgTable(
  "countdowns",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .default(sql`(auth.user_id())`)
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    targetAt: bigint("target_at", { mode: "number" }).notNull(),
    startedAt: bigint("started_at", { mode: "number" }).notNull(),
    endsAt: bigint("ends_at", { mode: "number" }).notNull(),
    status: text("status").notNull(),
    colorTag: text("color_tag").notNull(),
    category: text("category"),
    hasCelebrated: boolean("has_celebrated").notNull().default(false),
    archivedAt: bigint("archived_at", { mode: "number" }),
    recurrence: text("recurrence"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId),
      modify: authUid(table.userId),
    }),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type CountdownRow = typeof countdowns.$inferSelect;
export type NewCountdownRow = typeof countdowns.$inferInsert;
