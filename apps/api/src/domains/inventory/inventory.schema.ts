import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';
import { locations } from '../iam/locations/locations.schema';
import { ingredients } from '../culinary/culinary.schema';
import { users } from '../iam/users/users.schema';

export const stockLedger = pgTable('stock_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  locationId: uuid('location_id')
    .references(() => locations.id)
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  amount: integer('amount').notNull(), // Positive for stock-in, negative for stock-out
  type: varchar('type', { length: 50 }).notNull(), // "invoice", "sale", "waste", "adjustment", "audit"
  referenceId: uuid('reference_id'), // Link to Invoice ID, Order ID, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockAudits = pgTable('stock_audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  locationId: uuid('location_id')
    .references(() => locations.id)
    .notNull(),
  performedBy: uuid('performed_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockAuditItems = pgTable('stock_audit_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id')
    .references(() => stockAudits.id, { onDelete: 'cascade' })
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  actualAmount: integer('actual_amount').notNull(),
  theoreticalAmount: integer('theoretical_amount').notNull(),
  variance: integer('variance').notNull(),
});

export const wastageEvents = pgTable('wastage_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  amount: integer('amount').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(), // "spilled", "spoiled", "burned", "returned"
  notes: text('note'),
  reportedBy: uuid('reported_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});