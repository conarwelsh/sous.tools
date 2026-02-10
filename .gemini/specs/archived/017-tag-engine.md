# Spec 017: Unified Tag Engine

## Status
**Drafting**

## Context
The system requires a flexible, organization-scoped tagging system to categorize and filter various entities (Recipes, Layouts, Ingredients, Hardware, etc.). To avoid "table bloat" (creating `recipe_tags`, `layout_tags`, etc.), we will implement a polymorphic tagging engine.

## Objectives
- Provide a single source of truth for tag definitions.
- Enable tagging for any UUID-based entity in the system.
- Support organization-level isolation for tags.
- Allow for color-coding and metadata on tags.

## Technical Design

### 1. Database Schema (Drizzle)

We will use two primary tables:

```typescript
// Define the tag itself
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).default('#3b82f6'), // Hex color
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.organizationId, t.name) // Tags must be unique within an org
]);

// Polymorphic join table
export const tagAssignments = pgTable('tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'layout', 'recipe', 'ingredient', etc.
  entityId: uuid('entity_id').notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.tagId, t.entityType, t.entityId) // Prevent duplicate assignments
]);
```

### 2. API Architecture

- **`TagController`**: Centralized CRUD for tag definitions.
- **`TagService`**:
    - `getTags(orgId, entityType?)`: Fetch available tags.
    - `assignTags(entityType, entityId, tagIds[])`: Sync tags for an entity.
    - `getAssignments(entityType, entityId)`: Get tags for a specific entity.

### 3. Shared Features (@sous/features)

We will implement a `TagManager` component that can be dropped into any property editor:

```tsx
<TagManager 
  entityType="layout" 
  entityId={layout.id} 
  initialTagIds={layout.tagIds} 
/>
```

## Considerations
- **Search Performance**: We should index `(entityType, entityId)` on the assignments table for fast lookups.
- **Cascading**: When a `Tag` is deleted, its assignments must be automatically removed.
- **System Tags**: Support for "read-only" system tags provided by the platform.
