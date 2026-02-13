import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema';
import { roleEnum } from '../iam.schema';
import { users } from '../users/users.schema';

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  role: roleEnum('role').notNull().default('user'),
  token: text('token').notNull().unique(),
  invitedById: uuid('invited_by_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
