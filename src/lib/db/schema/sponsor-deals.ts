import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { user } from './auth';

export const sponsorDeals = pgTable('sponsor_deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  dealName: text('deal_name').notNull(),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type NewSponsorDeal = InferInsertModel<typeof sponsorDeals>;
export type SponsorDeal = InferSelectModel<typeof sponsorDeals>;