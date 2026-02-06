import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { logger } from '@sous/logger';

@Injectable()
export class IntelligenceService {
  constructor(@InjectQueue('intelligence') private intelligenceQueue: Queue) {}

  async queueRecipeCosting(recipeId: string, organizationId: string) {
    logger.info(`Queuing costing calculation for recipe ${recipeId}`);
    await this.intelligenceQueue.add('calculate-recipe-cost', {
      recipeId,
      organizationId,
    });
  }

  async queuePriceTrendAnalysis(ingredientId: string, organizationId: string) {
    await this.intelligenceQueue.add('analyze-price-trend', {
      ingredientId,
      organizationId,
    });
  }
}
