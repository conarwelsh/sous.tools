import { pgTable, uuid, varchar, timestamp, integer, pgEnum, unique } from 'drizzle-orm/pg-core';
import { organizations, plans } from '../iam/organizations/organizations.schema';

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'past_due',
  'canceled',
  'trialing',
]);

export const billingPlans = pgTable('billing_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  priceMonthly: integer('price_monthly').notNull(), // cents
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  accessPlanId: uuid('access_plan_id').references(() => plans.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const billingSubscriptions = pgTable('billing_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'stripe', 'cardconnect'
  externalCustomerId: varchar('external_customer_id', { length: 255 }),
  externalSubscriptionId: varchar('external_subscription_id', { length: 255 }),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  unq: unique().on(table.organizationId, table.provider),
}));

// For backward compatibility or other usage
export const billings = billingSubscriptions;
