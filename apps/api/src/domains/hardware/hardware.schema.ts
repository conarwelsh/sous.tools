import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from '../iam/organizations/organizations.schema';
import { locations } from '../iam/locations/locations.schema';

export const deviceTypeEnum = pgEnum('device_type', [
  'signage',
  'kds',
  'pos',
  'gateway',
  'watch',
]);

export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id), // Nullable if not paired
  locationId: uuid('location_id').references(() => locations.id),
  type: deviceTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  hardwareId: varchar('hardware_id', { length: 255 }).notNull().unique(), // Unique identifier from hardware
  ipAddress: varchar('ip_address', { length: 50 }),
  status: varchar('status', { length: 50 }).default('offline').notNull(),
  requiredVersion: varchar('required_version', { length: 50 }),
  lastHeartbeat: timestamp('last_heartbeat'),
  metadata: text('metadata'), // JSON string: CPU, Mem, OS details
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pairingCodes = pgTable('pairing_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  deviceType: deviceTypeEnum('device_type').notNull(),
  hardwareId: varchar('hardware_id', { length: 255 }).notNull(),
  metadata: text('metadata'), // JSON details about the device
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
