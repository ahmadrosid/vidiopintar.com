import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const transactions = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  planType: text("plan_type").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("IDR"),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"),
  transactionReference: text("transaction_reference").notNull().unique(),
  status: text("status").notNull().default("pending"),
  paymentSettings: text("payment_settings"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestampMs("created_at").$defaultFn(() => new Date()),
  updatedAt: timestampMs("updated_at").$defaultFn(() => new Date()),
  confirmedAt: timestampMs("confirmed_at"),
  expiresAt: timestampMs("expires_at"),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionWithUser = Transaction & {
  user: { name: string; email: string } | null;
};

export type TransactionStatus =
  | "pending"
  | "waiting_confirmation"
  | "confirmed"
  | "expired"
  | "cancelled";
export type PlanType = "monthly" | "yearly";
