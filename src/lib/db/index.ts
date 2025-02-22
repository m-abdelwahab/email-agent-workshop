import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
export * from "drizzle-orm";

export const db = drizzle(process.env.DATABASE_URL, {
  schema,
  casing: "snake_case",
});
