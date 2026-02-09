import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema.js';
import { devices } from '../hardware/hardware.schema.js';
import { recipes } from '../culinary/culinary.schema.js';
import { ingredients } from '../culinary/culinary.schema.js';

export const telemetry = pgTable('telemetry', {
  id: uuid('id').primaryKey().defaultRandom(),
  deviceId: uuid('device_id').references(() => devices.id),
  hardwareId: varchar('hardware_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g. "cpu_temp", "memory_usage", "ble_signal"
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g. "sales", "inventory", "labor"
  data: text('content').notNull(), // JSON blob
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const costingSnapshots = pgTable('costing_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  recipeId: uuid('recipe_id')
    .references(() => recipes.id)
    .notNull(),
  cost: integer('cost').notNull(), // Total cost in cents
  margin: decimal('margin', { precision: 5, scale: 2 }), // Profit margin %
  date: timestamp('date').defaultNow().notNull(),
});

export const priceTrends = pgTable('price_trends', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  trend: varchar('trend', { length: 20 }).notNull(), // "up", "down", "stable"
  volatilityScore: decimal('volatility_score', { precision: 5, scale: 2 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Need to import integer
import { integer } from 'drizzle-orm/pg-core';
