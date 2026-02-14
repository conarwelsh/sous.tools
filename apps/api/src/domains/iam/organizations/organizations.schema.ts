import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';

export const planStatusEnum = pgEnum('plan_status', [
  'active',
  'pending_payment',
  'grace_period',
  'suspended',
  'expired',
]);

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  baseScopes: jsonb('base_scopes').default([]).notNull(), // Array of FeatureScope
  limits: jsonb('limits').default({}).notNull(), // Record<MetricKey, number>
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),

  // Billing/Plan fields
  planId: uuid('plan_id').references(() => plans.id),
  planStatus: planStatusEnum('plan_status').default('active').notNull(),
  gracePeriodEndsAt: timestamp('grace_period_ends_at'),
  scopeOverrides: jsonb('scope_overrides').default([]).notNull(),
  limitOverrides: jsonb('limit_overrides').default({}).notNull(),

  // Sales attribution
  attributedSalesmanId: uuid('attributed_salesman_id'),
  commissionBps: integer('commission_bps').default(0).notNull(), // Basis points (100 = 1%)

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usageMetrics = pgTable('usage_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  metricKey: varchar('metric_key', { length: 100 }).notNull(),
  currentCount: integer('current_count').default(0).notNull(),
  lastResetAt: timestamp('last_reset_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
