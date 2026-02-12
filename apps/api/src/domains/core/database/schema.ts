import { relations } from 'drizzle-orm';

// 1. Base / Independent
export * from '../../iam/iam.schema';
export * from '../../iam/organizations/organizations.schema';

// 2. Depends on Organizations
export * from '../../iam/locations/locations.schema';
export * from '../../iam/users/users.schema';
export * from '../../media/media.schema';
export * from '../../culinary/culinary.schema';
export * from '../../culinary/catalog/catalog.schema';
export * from '../../accounting/accounting.schema';
export * from '../../integrations/integrations.schema';
export * from '../tags/tags.schema';
export * from '../ingestion/ingestion.schema';

// 3. Mixed Dependencies
export * from '../../procurement/procurement.schema';
export * from '../../hardware/hardware.schema';
export * from '../../presentation/presentation.schema';

// 4. Heavy Dependencies
export * from '../../inventory/inventory.schema';
export * from '../../intelligence/intelligence.schema';

// Import for relations
import { organizations } from '../../iam/organizations/organizations.schema';
import { users } from '../../iam/users/users.schema';
import { displays } from '../../presentation/presentation.schema';
import { layouts } from '../../presentation/presentation.schema';
import { displayAssignments } from '../../presentation/presentation.schema';
import { recipes } from '../../culinary/culinary.schema';
import { recipeIngredients } from '../../culinary/culinary.schema';
import { ingredients } from '../../culinary/culinary.schema';
import { categories, products } from '../../culinary/catalog/catalog.schema';
import { tags, tagAssignments } from '../tags/tags.schema';
import { ingestionSessions } from '../ingestion/ingestion.schema';
import {
  suppliers,
  invoices,
  invoiceItems,
  purchaseOrders,
  poItems,
  vendorMappings,
} from '../../procurement/procurement.schema';
import {
  stockAudits,
  stockAuditItems,
  wastageEvents,
} from '../../inventory/inventory.schema';
import { recipeSteps, cookNotes } from '../../culinary/culinary.schema';

// --- Relations ---

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  locations: many(locations),
  categories: many(categories),
  products: many(products),
  tags: many(tags),
}));

import { locations } from '../../iam/locations/locations.schema';

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [categories.organizationId],
    references: [organizations.id],
  }),
  products: many(products),
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: 'subcategory',
  }),
  subcategories: many(categories, {
    relationName: 'subcategory',
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  organization: one(organizations, {
    fields: [products.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const displaysRelations = relations(displays, ({ many }) => ({
  assignments: many(displayAssignments),
}));

export const layoutsRelations = relations(layouts, ({ one, many }) => ({
  parent: one(layouts, {
    fields: [layouts.parentId],
    references: [layouts.id],
    relationName: 'derivatives',
  }),
  derivatives: many(layouts, {
    relationName: 'derivatives',
  }),
  assignments: many(displayAssignments),
}));

export const displayAssignmentsRelations = relations(
  displayAssignments,
  ({ one }) => ({
    display: one(displays, {
      fields: [displayAssignments.displayId],
      references: [displays.id],
    }),
    layout: one(layouts, {
      fields: [displayAssignments.layoutId],
      references: [layouts.id],
    }),
  }),
);

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
  steps: many(recipeSteps),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    ingredient: one(ingredients, {
      fields: [recipeIngredients.ingredientId],
      references: [ingredients.id],
    }),
  }),
);

export const recipeStepsRelations = relations(recipeSteps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeSteps.recipeId],
    references: [recipes.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tags.organizationId],
    references: [organizations.id],
  }),
  assignments: many(tagAssignments),
}));

export const tagAssignmentsRelations = relations(tagAssignments, ({ one }) => ({
  tag: one(tags, {
    fields: [tagAssignments.tagId],
    references: [tags.id],
  }),
}));
