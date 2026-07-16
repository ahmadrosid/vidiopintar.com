import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

const bool = (name: string) => integer(name, { mode: "boolean" });

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: bool("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  preferredLanguage: text("preferred_language").default("en").notNull(),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestampMs("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
