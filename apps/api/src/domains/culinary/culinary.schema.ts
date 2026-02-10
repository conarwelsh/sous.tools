import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';

export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  baseUnit: varchar('base_unit', { length: 50 }).notNull(), // e.g. "g", "ml", "each"
  currentPrice: integer('current_price'), // Latest price per base unit in cents
  lastPurchasedAt: timestamp('last_purchased_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  instructions: text('instructions'),
  yieldAmount: integer('yield_amount'),
  yieldUnit: varchar('yield_unit', { length: 50 }),
  isBakersPercentage: boolean('is_bakers_percentage').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .references(() => recipes.id)
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  amount: integer('amount').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  isBase: boolean('is_base').default(false).notNull(), // For bakers percentages
});
