import { relations } from 'drizzle-orm';

// 1. Base / Independent
export * from '../../iam/iam.schema';
export * from '../../iam/organizations/organizations.schema';
export * from '../../iam/oauth/oauth.schema';
export * from '../../iam/invitations/invitations.schema';
export * from '../../iam/auth/password-reset.schema';
export * from './platform.schema';

// 2. Depends on Organizations
export * from '../../iam/locations/locations.schema';
export * from '../../iam/users/users.schema';
export * from '../../media/media.schema';
export * from '../../culinary/culinary.schema';
export * from '../../culinary/catalog/catalog.schema';
export * from '../../sales/sales.schema';
export * from '../../accounting/accounting.schema';
export * from '../../integrations/integrations.schema';
export * from '../tags/tags.schema';
export * from '../ingestion/ingestion.schema';

// 3. Mixed Dependencies
export * from '../../procurement/procurement.schema';
export * from '../../pos/pos.schema';
export * from '../../hardware/hardware.schema';
export * from '../../presentation/presentation.schema';
export * from '../../billing/billing.schema.js';

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
  shoppingList,
} from '../../procurement/procurement.schema';
import {
  posOrders,
  posOrderProducts,
} from '../../pos/pos.schema';
import {
  stockAudits,
  stockAuditItems,
  wastageEvents,
} from '../../inventory/inventory.schema';
import { recipeSteps, cookNotes } from '../../culinary/culinary.schema';
import {
  plans,
  usageMetrics,
} from '../../iam/organizations/organizations.schema';
import {
  billingPlans,
  billingSubscriptions,
} from '../../billing/billing.schema.js';

import { invitations } from '../../iam/invitations/invitations.schema';
import { passwordResetTokens } from '../../iam/auth/password-reset.schema';

// --- Relations ---

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedById],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  users: many(users),
  locations: many(locations),
  categories: many(categories),
  products: many(products),
  tags: many(tags),
  plan: one(plans, {
    fields: [organizations.planId],
    references: [plans.id],
  }),
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

export const shoppingListRelations = relations(shoppingList, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [shoppingList.ingredientId],
    references: [ingredients.id],
  }),
  preferredSupplier: one(suppliers, {
    fields: [shoppingList.preferredSupplierId],
    references: [suppliers.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [invoices.supplierId],
    references: [suppliers.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  ingredient: one(ingredients, {
    fields: [invoiceItems.ingredientId],
    references: [ingredients.id],
  }),
}));

export const posOrdersRelations = relations(posOrders, ({ many }) => ({
  items: many(posOrderProducts),
}));

export const posOrderProductsRelations = relations(posOrderProducts, ({ one }) => ({
  order: one(posOrders, {
    fields: [posOrderProducts.orderId],
    references: [posOrders.id],
  }),
}));

export const cookNotesRelations = relations(cookNotes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [cookNotes.recipeId],
    references: [recipes.id],
  }),
  user: one(users, {
    fields: [cookNotes.userId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  organizations: many(organizations),
}));

export const usageMetricsRelations = relations(usageMetrics, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageMetrics.organizationId],
    references: [organizations.id],
  }),
}));

export const billingSubscriptionsRelations = relations(
  billingSubscriptions,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [billingSubscriptions.organizationId],
      references: [organizations.id],
    }),
  }),
);
