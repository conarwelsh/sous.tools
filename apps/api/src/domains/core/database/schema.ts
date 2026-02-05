import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';

// 1. IAM Enums
export const roleEnum = pgEnum('role', ['user', 'admin', 'superadmin']);

// 2. Organizations (Tenants)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  role: roleEnum('role').default('user').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Locations (Multi-site support within Organization)
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  timezone: varchar('timezone', { length: 100 }).default('UTC').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Media (Phase 1.7 Strategy)
export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  key: text('key').notNull(), // S3/Supabase key
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(), // In bytes
  width: integer('width'),
  height: integer('height'),
  blurHash: text('blur_hash'),
  metadata: text('metadata'), // JSON string
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Presentation Domain (Phase 2.1)
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

export const displayAssignments = pgTable('display_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayId: uuid('display_id')
    .references(() => displays.id)
    .notNull(),
  templateId: uuid('template_id')
    .references(() => templates.id)
    .notNull(),
  content: text('content').notNull(), // JSON: Binding data to slots
  schedule: text('schedule'), // JSON: Optional scheduling rules (Cron/Time ranges)
  priority: integer('priority').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
