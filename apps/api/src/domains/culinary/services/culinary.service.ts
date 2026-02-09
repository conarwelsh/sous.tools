import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  ingredients,
  recipes,
  recipeIngredients,
} from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class CulinaryService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

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
    return this.dbService.db
      .select()
      .from(recipes)
      .where(eq(recipes.organizationId, organizationId));
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
