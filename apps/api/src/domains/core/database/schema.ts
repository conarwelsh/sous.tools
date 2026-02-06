import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  pgEnum,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

// 7. Hardware & Pairing (ADR 017 & ADR 012)
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

// 8. Intelligence & Analytics (ADR 029)
export const telemetry = pgTable('telemetry', {
  id: uuid('id').primaryKey().defaultRandom(),
  deviceId: uuid('device_id').references(() => devices.id),
  hardwareId: varchar('hardware_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g. "cpu_temp", "memory_usage", "ble_signal"
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g. "sales", "inventory", "labor"
  data: text('content').notNull(), // JSON blob
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Procurement Domain (Phase 3.1)
export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull(),
  date: timestamp('date').notNull(),
  totalAmount: integer('total_amount').notNull(), // In cents
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, processed, archived
  mediaId: uuid('media_id').references(() => media.id), // Link to PDF/Image
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  pricePerUnit: integer('price_per_unit').notNull(), // In cents
  totalPrice: integer('total_price').notNull(), // In cents
  metadata: text('metadata'), // JSON extraction details
});

// 10. Culinary Domain (Phase 3.2)
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  baseUnit: varchar('base_unit', { length: 50 }).notNull(), // e.g. "g", "ml", "each"
  currentPrice: integer('current_price'), // Latest price per base unit in cents
  lastPurchasedAt: timestamp('last_purchased_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  instructions: text('instructions'),
  yieldAmount: integer('yield_amount'),
  yieldUnit: varchar('yield_unit', { length: 50 }),
  isBakersPercentage: boolean('is_bakers_percentage').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').references(() => recipes.id).notNull(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id).notNull(),
  amount: integer('amount').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  isBase: boolean('is_base').default(false).notNull(), // For bakers percentages
});

// 11. Inventory Domain (Phase 4.2)
export const stockLedger = pgTable('stock_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  locationId: uuid('location_id').references(() => locations.id).notNull(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id).notNull(),
  amount: integer('amount').notNull(), // Positive for stock-in, negative for stock-out
  type: varchar('type', { length: 50 }).notNull(), // "invoice", "sale", "waste", "adjustment"
  referenceId: uuid('reference_id'), // Link to Invoice ID, Order ID, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Intelligence Domain (Phase 4.1)
export const costingSnapshots = pgTable('costing_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  recipeId: uuid('recipe_id').references(() => recipes.id).notNull(),
  cost: integer('cost').notNull(), // Total cost in cents
  margin: decimal('margin', { precision: 5, scale: 2 }), // Profit margin %
  date: timestamp('date').defaultNow().notNull(),
});

export const priceTrends = pgTable('price_trends', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id).notNull(),
  trend: varchar('trend', { length: 20 }).notNull(), // "up", "down", "stable"
  volatilityScore: decimal('volatility_score', { precision: 5, scale: 2 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Accounting Domain (Phase 4.1)
export const generalLedger = pgTable('general_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // "debit", "credit"
  account: varchar('account', { length: 100 }).notNull(), // "COGS", "Revenue", "Inventory"
  amount: integer('amount').notNull(), // In cents
  referenceId: uuid('reference_id'), // Link to Invoice, Order, etc.
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Integrations Domain (Phase 5.1)
export const integrationConfigs = pgTable('integration_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // "square", "toast", "google_drive"
  encryptedCredentials: text('encrypted_credentials').notNull(),
  settings: text('settings'), // JSON string
  isActive: boolean('is_active').default(true).notNull(),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Relations ---

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  locations: many(locations),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const displaysRelations = relations(displays, ({ many }) => ({
  assignments: many(displayAssignments),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  assignments: many(displayAssignments),
}));

export const displayAssignmentsRelations = relations(displayAssignments, ({ one }) => ({
  display: one(displays, {
    fields: [displayAssignments.displayId],
    references: [displays.id],
  }),
  template: one(templates, {
    fields: [displayAssignments.templateId],
    references: [templates.id],
  }),
}));

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));
