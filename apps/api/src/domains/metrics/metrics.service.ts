import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service.js';
import {
  posOrders,
  recipes,
  ingredients,
  invoices,
  displays,
} from '../core/database/schema.js';
import { eq, and, sql, gte } from 'drizzle-orm';

@Injectable()
export class MetricsService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  async getDailySales(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.dbService.db
      .select({
        total: sql<string | number>`sum(${posOrders.totalAmount})`,
      })
      .from(posOrders)
      .where(
        and(
          eq(posOrders.organizationId, organizationId),
          eq(posOrders.status, 'COMPLETED'),
          gte(posOrders.createdAt, today),
        ),
      );

    const rawTotal = result[0]?.total;
    const totalCents =
      typeof rawTotal === 'string' ? parseInt(rawTotal, 10) : rawTotal || 0;

    return { value: totalCents / 100, unit: 'USD' };
  }

  async getRecipesCount(organizationId: string) {
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(recipes)
      .where(eq(recipes.organizationId, organizationId));
    return { value: result[0]?.count || 0 };
  }

  async getIngredientsCount(organizationId: string) {
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(ingredients)
      .where(eq(ingredients.organizationId, organizationId));
    return { value: result[0]?.count || 0 };
  }

  async getPendingInvoicesCount(organizationId: string) {
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, organizationId),
          eq(invoices.status, 'pending'),
        ),
      );
    return { value: result[0]?.count || 0 };
  }

  async getConnectedNodesCount(organizationId: string) {
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(displays)
      .where(eq(displays.organizationId, organizationId));
    return { value: result[0]?.count || 0 };
  }
}
