import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from '../../iam/organizations/organizations.schema';

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    color: varchar('color', { length: 7 }).default('#3b82f6'), // Hex color
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.organizationId, t.name), // Tags must be unique within an org
  ],
);

export const tagAssignments = pgTable(
  'tag_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tagId: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(), // 'layout', 'recipe', 'ingredient', etc.
    entityId: uuid('entity_id').notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.tagId, t.entityType, t.entityId), // Prevent duplicate assignments
    index('tag_assignments_entity_idx').on(t.entityType, t.entityId), // Fast lookups by entity
  ],
);
