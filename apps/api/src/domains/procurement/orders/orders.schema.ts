import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { organizations } from '../../iam/organizations/organizations.schema';
import { ingredients } from '../../culinary/culinary.schema';
import { suppliers } from '../procurement.schema';

export const shoppingList = pgTable('shopping_list', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  preferredSupplierId: uuid('supplier_id').references(() => suppliers.id),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, ordered, ignored
  source: varchar('source', { length: 50 }).default('manual').notNull(), // manual, system_suggestion
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
