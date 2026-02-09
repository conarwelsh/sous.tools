import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema.js';

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
