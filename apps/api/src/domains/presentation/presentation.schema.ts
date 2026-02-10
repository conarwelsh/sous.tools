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

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  structure: text('structure').notNull(), // JSON: Grid definition, slots, etc.
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

export const screens = pgTable('screens', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  layoutId: uuid('layout_id')
    .references(() => templates.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slots: text('slots').notNull(), // JSON: Record<string, SlotAssignment>
  assignments: text('assignments').notNull(), // JSON: webSlug, isPublic, etc.
  customCss: text('custom_css'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const displayAssignments = pgTable('display_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayId: uuid('display_id')
    .references(() => displays.id)
    .notNull()
    .unique(),
  screenId: uuid('screen_id')
    .references(() => screens.id)
    .notNull(),
  schedule: text('schedule'), // JSON: Optional scheduling rules (Cron/Time ranges)
  priority: integer('priority').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
