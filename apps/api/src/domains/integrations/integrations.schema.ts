import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';

export const integrationConfigs = pgTable(
  'integration_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id)
      .notNull(),
    provider: varchar('provider', { length: 50 }).notNull(), // "square", "toast", "google_drive"
    encryptedCredentials: text('encrypted_credentials').notNull(),
    settings: text('settings'), // JSON string
    isActive: boolean('is_active').default(true).notNull(),
    lastSyncedAt: timestamp('last_synced_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    unq: unique().on(table.organizationId, table.provider),
  }),
);
