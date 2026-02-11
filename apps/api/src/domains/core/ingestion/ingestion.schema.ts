import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { organizations } from '../../iam/organizations/organizations.schema';

export const ingestionSessions = pgTable('ingestion_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(), // "invoice", "recipe"
  status: varchar('status', { length: 50 }).default('processing').notNull(), // processing, review, completed, error
  sourceImages: jsonb('source_images').default([]).notNull(), // Array of media IDs or URLs
  extractedData: jsonb('extracted_data'), // JSON blob from AI
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
