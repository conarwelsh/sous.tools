import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';
import { locations } from '../iam/locations/locations.schema';

export const layouts = pgTable('layouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  parentId: uuid('parent_id'), // Optional: Link to the template this was derived from
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).default('TEMPLATE').notNull(), // 'TEMPLATE' | 'SCREEN' | 'LABEL' | 'PAGE'
  structure: text('structure').notNull(), // JSON: Grid definition, slots, etc.
  content: text('content').default('{}').notNull(), // JSON: Slot assignments / data mapping
  config: text('config').default('{}').notNull(), // JSON: Metadata (webSlug, dimensions, etc)
  isSystem: boolean('is_system').default(false).notNull(), // Seeded templates
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const displays = pgTable('displays', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  locationId: uuid('location_id').references(() => locations.id), // Optional: Global vs Local
  name: varchar('name', { length: 255 }).notNull(),
  hardwareId: varchar('hardware_id', { length: 255 }), // Mac Address or Device ID
  resolution: varchar('resolution', { length: 50 }), // e.g. "1920x1080"
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const displayAssignments = pgTable('display_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayId: uuid('display_id')
    .references(() => displays.id)
    .notNull()
    .unique(),
  layoutId: uuid('layout_id')
    .references(() => layouts.id)
    .notNull(),
  schedule: text('schedule'), // JSON: Optional scheduling rules (Cron/Time ranges)
  priority: integer('priority').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
