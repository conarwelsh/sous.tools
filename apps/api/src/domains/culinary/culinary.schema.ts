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
import { users } from '../iam/users/users.schema';

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
  yieldAmount: integer('yield_amount'),
  yieldUnit: varchar('yield_unit', { length: 50 }),
  isBakersPercentage: boolean('is_bakers_percentage').default(false).notNull(),
  linkedPosItemId: varchar('linked_pos_item_id', { length: 255 }), // Link to Square/Toast item
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .references(() => recipes.id, { onDelete: 'cascade' })
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  amount: integer('amount').notNull(), // Scaled by 1000 for precision if needed, but here simple int
  unit: varchar('unit', { length: 50 }).notNull(),
  isBase: boolean('is_base').default(false).notNull(), // For bakers percentages
  wastageFactor: integer('wastage_factor').default(0).notNull(), // In basis points (0-10000)
});

export const recipeSteps = pgTable('recipe_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .references(() => recipes.id, { onDelete: 'cascade' })
    .notNull(),
  order: integer('order').notNull(),
  instruction: text('instruction').notNull(),
  timerDuration: integer('timer_duration'), // In seconds
});

export const cookNotes = pgTable('cook_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .references(() => recipes.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  note: text('note').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
