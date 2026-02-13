import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';
import { media } from '../media/media.schema';
import { ingredients } from '../culinary/culinary.schema';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
  // Constraints (Spec 016)
  minOrderValue: integer('min_order_value').default(0).notNull(), // In cents
  deliveryDays: jsonb('delivery_days').default([]).notNull(), // Array of numbers 0-6
  cutoffTime: varchar('cutoff_time', { length: 5 }), // "16:00"
  accountNumber: varchar('account_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  supplierId: uuid('supplier_id')
    .references(() => suppliers.id)
    .notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull(),
  date: timestamp('date').notNull(),
  totalAmount: integer('total_amount').notNull(), // In cents
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, processed, archived
  mediaId: uuid('media_id').references(() => media.id), // Link to PDF/Image
  purchaseOrderId: uuid('purchase_order_id'), // Set if reconciled (Spec 014)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  pricePerUnit: integer('price_per_unit').notNull(), // In cents
  totalPrice: integer('total_price').notNull(), // In cents
  ingredientId: uuid('ingredient_id').references(() => ingredients.id), // Mapped ingredient
  metadata: text('metadata'), // JSON extraction details
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  supplierId: uuid('supplier_id')
    .references(() => suppliers.id)
    .notNull(),
  status: varchar('status', { length: 50 }).default('open').notNull(), // open, partial, fulfilled, cancelled
  totalAmount: integer('total_amount').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const poItems = pgTable('po_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchaseOrderId: uuid('purchase_order_id')
    .references(() => purchaseOrders.id, { onDelete: 'cascade' })
    .notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  priceAtOrder: integer('price_at_order'), // Historical price when ordered
});

export const vendorMappings = pgTable('vendor_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  supplierId: uuid('supplier_id')
    .references(() => suppliers.id)
    .notNull(),
  externalCode: varchar('external_code', { length: 100 }).notNull(), // Vendor SKU
  externalDescription: text('external_description').notNull(),
  ingredientId: uuid('ingredient_id')
    .references(() => ingredients.id)
    .notNull(),
  conversionFactor: integer('conversion_factor').default(1000).notNull(), // Multiply by this to get base unit (scaled by 1000)
  conversionUnit: varchar('conversion_unit', { length: 50 }).notNull(), // Unit from vendor
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
