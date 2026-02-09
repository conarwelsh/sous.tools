import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { priceTrends, ingredients } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class PriceTrendService {
  constructor(private readonly dbService: DatabaseService) {}

  async analyzeTrend(ingredientId: string, organizationId: string) {
    // Mock Trend Analysis: Randomly assign Up/Down/Stable
    const trend =
      Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';
    const score = (Math.random() * 10).toFixed(2);

    await this.dbService.db.insert(priceTrends).values({
      organizationId,
      ingredientId,
      trend,
      volatilityScore: score,
    });

    return { trend, score };
  }
}
