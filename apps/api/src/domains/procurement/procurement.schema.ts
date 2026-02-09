import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema.js';
import { media } from '../media/media.schema.js';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .references(() => invoices.id)
    .notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  pricePerUnit: integer('price_per_unit').notNull(), // In cents
  totalPrice: integer('total_price').notNull(), // In cents
  metadata: text('metadata'), // JSON extraction details
});
