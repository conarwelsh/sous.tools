import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  ingredients,
  recipes,
  recipeIngredients,
  recipeSteps,
  categories,
  products,
} from '../../core/database/schema.js';
import { tags, tagAssignments } from '../../core/tags/tags.schema.js';
import { eq, and, ilike, exists } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class CulinaryService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  // --- Catalog ---
  async getCategories(organizationId: string) {
    return this.dbService.db
      .select()
      .from(categories)
      .where(eq(categories.organizationId, organizationId));
  }

  async createCategory(data: typeof categories.$inferInsert) {
    const result = await this.dbService.db
      .insert(categories)
      .values(data)
      .returning();
    return result[0];
  }

  async getProducts(organizationId: string, categoryId?: string) {
    const filters = [eq(products.organizationId, organizationId)];
    if (categoryId) {
      filters.push(eq(products.categoryId, categoryId));
    }

    return this.dbService.db
      .select()
      .from(products)
      .where(and(...filters));
  }

  async getProductByName(organizationId: string, name: string) {
    return this.dbService.db.query.products.findFirst({
      where: and(
        eq(products.organizationId, organizationId),
        eq(products.name, name),
      ),
    });
  }

  async createProduct(data: typeof products.$inferInsert) {
    const result = await this.dbService.db
      .insert(products)
      .values(data)
      .returning();
    return result[0];
  }

  async seedSystem(orgId: string) {
    logger.info('  └─ Seeding Culinary System Data...');
  }

  async seedSample(orgId: string) {
    logger.info('  └─ Seeding Culinary Sample Data...');
    const [flour] = await this.dbService.db
      .insert(ingredients)
      .values({
        name: 'All-Purpose Flour',
        baseUnit: 'kg',
        currentPrice: 120,
        organizationId: orgId,
      })
      .onConflictDoNothing()
      .returning();

    await this.dbService.db
      .insert(recipes)
      .values({
        name: 'Simple Bread',
        yieldAmount: 1000,
        yieldUnit: 'g',
        organizationId: orgId,
      })
      .onConflictDoNothing();

    // Catalog Seeding
    const [beers] = await this.dbService.db
      .insert(categories)
      .values({
        name: 'Draft Beers',
        organizationId: orgId,
      })
      .onConflictDoNothing()
      .returning();

    const [burgers] = await this.dbService.db
      .insert(categories)
      .values({
        name: 'Burgers',
        organizationId: orgId,
      })
      .onConflictDoNothing()
      .returning();

    if (beers) {
      await this.dbService.db
        .insert(products)
        .values([
          {
            name: 'Pilsner',
            price: 700,
            categoryId: beers.id,
            organizationId: orgId,
          },
          {
            name: 'IPA',
            price: 800,
            categoryId: beers.id,
            organizationId: orgId,
          },
        ])
        .onConflictDoNothing();
    }

    if (burgers) {
      await this.dbService.db
        .insert(products)
        .values([
          {
            name: 'Classic Burger',
            price: 1500,
            categoryId: burgers.id,
            organizationId: orgId,
          },
          {
            name: 'Cheeseburger',
            price: 1700,
            categoryId: burgers.id,
            organizationId: orgId,
          },
        ])
        .onConflictDoNothing();
    }
  }

  async getIngredients(organizationId: string) {
    return this.dbService.db
      .select()
      .from(ingredients)
      .where(eq(ingredients.organizationId, organizationId));
  }

  async createIngredient(data: typeof ingredients.$inferInsert) {
    const result = await this.dbService.db
      .insert(ingredients)
      .values(data)
      .returning();
    return result[0];
  }

  async getRecipes(
    organizationId: string,
    options?: { search?: string; source?: string; tags?: string[] },
  ) {
    const filters = [eq(recipes.organizationId, organizationId)];

    if (options?.source) {
      filters.push(eq(recipes.sourceType, options.source));
    }

    if (options?.tags && options.tags.length > 0) {
      filters.push(
        exists(
          this.dbService.db
            .select()
            .from(tagAssignments)
            .innerJoin(tags, eq(tagAssignments.tagId, tags.id))
            .where(
              and(
                eq(tagAssignments.entityType, 'recipe'),
                eq(tagAssignments.entityId, recipes.id),
                and(...options.tags.map((t) => eq(tags.name, t))),
              ),
            ),
        ),
      );
    }

    return this.dbService.db.query.recipes.findMany({
      where: options?.search
        ? and(...filters, ilike(recipes.name, `%${options.search}%`))
        : and(...filters),
      with: {
        ingredients: {
          with: {
            ingredient: true,
          },
        },
        steps: true,
      },
    });
  }

  async getRecipe(id: string, organizationId: string) {
    return this.dbService.db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, id),
        eq(recipes.organizationId, organizationId),
      ),
      with: {
        ingredients: {
          with: {
            ingredient: true,
          },
        },
        steps: true,
      },
    });
  }

  async createRecipe(
    data: typeof recipes.$inferInsert,
    ingredientsList: (typeof recipeIngredients.$inferInsert)[],
  ) {
    return await this.dbService.db.transaction(async (tx) => {
      const [recipe] = await tx.insert(recipes).values(data).returning();

      if (ingredientsList.length > 0) {
        await tx
          .insert(recipeIngredients)
          .values(
            ingredientsList.map((ri) => ({ ...ri, recipeId: recipe.id })),
          );
      }

      return recipe;
    });
  }

  async updateRecipe(
    id: string,
    organizationId: string,
    data: Partial<typeof recipes.$inferInsert>,
    ingredientsList?: (typeof recipeIngredients.$inferInsert)[],
    stepsList?: (typeof recipeSteps.$inferInsert)[],
  ) {
    return await this.dbService.db.transaction(async (tx) => {
      // 1. Update recipe metadata
      const [recipe] = await tx
        .update(recipes)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(eq(recipes.id, id), eq(recipes.organizationId, organizationId)),
        )
        .returning();

      if (!recipe) throw new Error('Recipe not found or access denied');

      // 2. Update ingredients if provided
      if (ingredientsList) {
        await tx
          .delete(recipeIngredients)
          .where(eq(recipeIngredients.recipeId, id));
        if (ingredientsList.length > 0) {
          await tx
            .insert(recipeIngredients)
            .values(ingredientsList.map((ri) => ({ ...ri, recipeId: id })));
        }
      }

      // 3. Update steps if provided
      if (stepsList) {
        await tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, id));
        if (stepsList.length > 0) {
          await tx
            .insert(recipeSteps)
            .values(stepsList.map((rs) => ({ ...rs, recipeId: id })));
        }
      }

      return recipe;
    });
  }

  async deleteRecipe(id: string, organizationId: string) {
    return await this.dbService.db.transaction(async (tx) => {
      await tx
        .delete(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, id));
      await tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, id));

      const [deleted] = await tx
        .delete(recipes)
        .where(
          and(eq(recipes.id, id), eq(recipes.organizationId, organizationId)),
        )
        .returning();

      return deleted;
    });
  }
}
