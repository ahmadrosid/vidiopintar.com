import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const paymentSettings = sqliteTable("payment_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bankName: text("bank_name").notNull(),
  bankAccountNumber: text("bank_account_number").notNull(),
  bankAccountName: text("bank_account_name").notNull(),
  whatsappPhoneNumber: text("whatsapp_phone_number").notNull(),
  whatsappMessageTemplate: text("whatsapp_message_template").notNull(),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestampMs("created_at").$defaultFn(() => new Date()),
  updatedAt: timestampMs("updated_at").$defaultFn(() => new Date()),
});

export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type NewPaymentSettings = typeof paymentSettings.$inferInsert;
