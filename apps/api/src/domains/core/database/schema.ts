import { relations } from 'drizzle-orm';

// Re-export from domain schemas
export * from '../../iam/iam.schema.js';
export * from '../../iam/organizations/organizations.schema.js';
export * from '../../iam/users/users.schema.js';
export * from '../../iam/locations/locations.schema.js';
export * from '../../media/media.schema.js';
export * from '../../presentation/presentation.schema.js';
export * from '../../hardware/hardware.schema.js';
export * from '../../intelligence/intelligence.schema.js';
export * from '../../procurement/procurement.schema.js';
export * from '../../culinary/culinary.schema.js';
export * from '../../inventory/inventory.schema.js';
export * from '../../accounting/accounting.schema.js';
export * from '../../integrations/integrations.schema.js';

// Import for relations
import { organizations } from '../../iam/organizations/organizations.schema.js';
import { users } from '../../iam/users/users.schema.js';
import { displays } from '../../presentation/presentation.schema.js';
import { templates } from '../../presentation/presentation.schema.js';
import { displayAssignments } from '../../presentation/presentation.schema.js';
import { recipes } from '../../culinary/culinary.schema.js';
import { recipeIngredients } from '../../culinary/culinary.schema.js';
import { ingredients } from '../../culinary/culinary.schema.js';

// --- Relations ---

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  locations: many(locations),
}));

import { locations } from '../../iam/locations/locations.schema.js';

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

export const displayAssignmentsRelations = relations(
  displayAssignments,
  ({ one }) => ({
    display: one(displays, {
      fields: [displayAssignments.displayId],
      references: [displays.id],
    }),
    template: one(templates, {
      fields: [displayAssignments.templateId],
      references: [templates.id],
    }),
  }),
);

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
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
