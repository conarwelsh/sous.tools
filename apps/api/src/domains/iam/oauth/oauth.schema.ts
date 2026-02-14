import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema';

export const oauthClients = pgTable('oauth_clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  clientId: varchar('client_id', { length: 100 }).notNull().unique(),
  clientSecret: varchar('client_secret', { length: 255 }).notNull(),
  redirectUris: jsonb('redirect_uris').default([]).notNull(), // Array of strings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const oauthAuthorizationCodes = pgTable('oauth_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .references(() => oauthClients.id)
    .notNull(),
  userId: uuid('user_id').notNull(),
  code: varchar('code', { length: 255 }).notNull().unique(),
  scopes: jsonb('scopes').default([]).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
