import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  date: text("date").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  summary: text("summary").notNull(),
  labels: text("labels")
    .notNull()
    .array()
    .default(sql`'{}'::text[]`),
});
