import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { stockLedger } from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class InventoryService {
  constructor(private readonly dbService: DatabaseService) {}

  async getLedger(organizationId: string, locationId?: string) {
    const filters = [eq(stockLedger.organizationId, organizationId)];
    if (locationId) filters.push(eq(stockLedger.locationId, locationId));
    
    return this.dbService.db.select().from(stockLedger).where(and(...filters));
  }

  async recordMovement(data: typeof stockLedger.$inferInsert) {
    const result = await this.dbService.db.insert(stockLedger).values(data).returning();
    return result[0];
  }

  async depleteStock(organizationId: string, locationId: string, ingredientId: string, amount: number) {
    return this.recordMovement({
      organizationId,
      locationId,
      ingredientId,
      amount: -amount,
      type: 'sale',
    });
  }
}
