import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  recipes,
  recipeIngredients,
  ingredients,
  costingSnapshots,
} from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class CostingService {
  constructor(private readonly dbService: DatabaseService) {}

  async calculateRecipeCost(recipeId: string, organizationId: string) {
    logger.info(`Calculating cost for recipe ${recipeId}`);

    const recipe = (await this.dbService.db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, recipeId),
        eq(recipes.organizationId, organizationId),
      ),
      with: {
        ingredients: {
          with: {
            ingredient: true,
          },
        },
      },
    })) as any;

    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    let totalCost = 0;

    for (const ri of recipe.ingredients) {
      const ingredient = ri.ingredient;
      if (!ingredient.currentPrice) {
        logger.warn(
          `Ingredient ${ingredient.name} has no price. Skipping in cost calc.`,
        );
        continue;
      }

      // Detailed Unit Conversion (ADR 018)
      const conversionFactor = this.getConversionFactor(
        ri.unit,
        ingredient.baseUnit,
      );
      const normalizedAmount = ri.amount * conversionFactor;

      totalCost += normalizedAmount * ingredient.currentPrice;
    }

    // Save Snapshot
    await this.dbService.db.insert(costingSnapshots).values({
      organizationId,
      recipeId,
      cost: totalCost,
      margin: '0.00', // Placeholder for sales integration
    });

    logger.info(`Recipe ${recipe.name} cost: $${totalCost / 100}`);
    return totalCost;
  }

  private getConversionFactor(fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return 1;

    const units: Record<string, number> = {
      g: 1,
      kg: 1000,
      oz: 28.35,
      lb: 453.59,
      ml: 1,
      l: 1000,
      tsp: 5,
      tbsp: 15,
      cup: 240,
    };

    const fromFactor = units[fromUnit.toLowerCase()];
    const toFactor = units[toUnit.toLowerCase()];

    if (!fromFactor || !toFactor) {
      logger.warn(
        `Unknown units for conversion: ${fromUnit} -> ${toUnit}. Assuming 1:1.`,
      );
      return 1;
    }

    return fromFactor / toFactor;
  }
}
