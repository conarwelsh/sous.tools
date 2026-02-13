import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';

export const posOrders = pgTable('pos_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  externalOrderId: varchar('external_order_id', { length: 255 }).notNull(), // Square/Toast Order ID
  source: varchar('source', { length: 50 }).notNull(), // "square", "toast"
  status: varchar('status', { length: 50 }).notNull(), // "COMPLETED", "OPEN", etc.
  totalAmount: integer('total_amount').notNull(), // In cents
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posOrderItems = pgTable('pos_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .references(() => posOrders.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: integer('total_amount').notNull(), // In cents
  linkedProductId: uuid('linked_product_id'), // Reference to our catalog product
});
