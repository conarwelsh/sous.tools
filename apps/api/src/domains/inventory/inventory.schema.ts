import { pgTable, uuid, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema.js';
import { locations } from '../iam/locations/locations.schema.js';
import { ingredients } from '../culinary/culinary.schema.js';

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
  type: varchar('type', { length: 50 }).notNull(), // "invoice", "sale", "waste", "adjustment"
  referenceId: uuid('reference_id'), // Link to Invoice ID, Order ID, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
