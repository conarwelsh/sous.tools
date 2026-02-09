import { pgTable, uuid, timestamp, varchar, integer, text } from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema.js';

export const generalLedger = pgTable('general_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // "debit", "credit"
  account: varchar('account', { length: 100 }).notNull(), // "COGS", "Revenue", "Inventory"
  amount: integer('amount').notNull(), // In cents
  referenceId: uuid('reference_id'), // Link to Invoice, Order, etc.
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
