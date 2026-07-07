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

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestampMs("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestampMs("created_at").notNull(),
  updatedAt: timestampMs("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestampMs("access_token_expires_at"),
  refreshTokenExpiresAt: timestampMs("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestampMs("created_at").notNull(),
  updatedAt: timestampMs("updated_at").notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestampMs("expires_at").notNull(),
  createdAt: timestampMs("created_at").$defaultFn(() => new Date()),
  updatedAt: timestampMs("updated_at").$defaultFn(() => new Date()),
});

export const schema = { user, session, account, verification };
