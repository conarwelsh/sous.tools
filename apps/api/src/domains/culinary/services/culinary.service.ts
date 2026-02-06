import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { ingredients, recipes, recipeIngredients } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class CulinaryService {
  constructor(private readonly dbService: DatabaseService) {}

  async getIngredients(organizationId: string) {
    return this.dbService.db.select().from(ingredients).where(eq(ingredients.organizationId, organizationId));
  }

  async createIngredient(data: typeof ingredients.$inferInsert) {
    const result = await this.dbService.db.insert(ingredients).values(data).returning();
    return result[0];
  }

  async getRecipes(organizationId: string) {
    return this.dbService.db.select().from(recipes).where(eq(recipes.organizationId, organizationId));
  }

  async createRecipe(data: typeof recipes.$inferInsert, ingredientsList: (typeof recipeIngredients.$inferInsert)[]) {
    return await this.dbService.db.transaction(async (tx) => {
      const [recipe] = await tx.insert(recipes).values(data).returning();
      
      if (ingredientsList.length > 0) {
        await tx.insert(recipeIngredients).values(
          ingredientsList.map(ri => ({ ...ri, recipeId: recipe.id }))
        );
      }
      
      return recipe;
    });
  }
}
