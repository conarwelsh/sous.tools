import { jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema';

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  timezone: varchar('timezone', { length: 100 }).default('UTC').notNull(),
  businessHours: jsonb('business_hours').default({}).notNull(), // Record<Day, { open: string, close: string }>
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
