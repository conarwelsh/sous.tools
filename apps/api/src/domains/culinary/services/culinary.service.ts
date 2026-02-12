import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  ingredients,
  recipes,
  recipeIngredients,
  categories,
  products,
} from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
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

  async getRecipes(organizationId: string) {
    return this.dbService.db.query.recipes.findMany({
      where: eq(recipes.organizationId, organizationId),
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
}
