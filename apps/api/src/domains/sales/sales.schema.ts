import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';
import { users } from '../iam/users/users.schema';

export const salesCommissions = pgTable('sales_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  salesmanId: uuid('salesman_id')
    .references(() => users.id)
    .notNull(),
  amount: integer('amount').notNull(), // cents
  bps: integer('bps').notNull(),
  externalPaymentId: varchar('external_payment_id', { length: 255 }), // Stripe Payment ID
  status: varchar('status', { length: 50 }).default('PENDING').notNull(), // "PENDING", "PAID"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
