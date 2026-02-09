import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { generalLedger } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class AccountingService {
  constructor(private readonly dbService: DatabaseService) {}

  async recordEntry(data: typeof generalLedger.$inferInsert) {
    const result = await this.dbService.db
      .insert(generalLedger)
      .values(data)
      .returning();
    return result[0];
  }

  async getLedger(organizationId: string) {
    return this.dbService.db
      .select()
      .from(generalLedger)
      .where(eq(generalLedger.organizationId, organizationId));
  }

  async generatePL(organizationId: string) {
    // Basic aggregation
    const entries = await this.getLedger(organizationId);
    const revenue = entries
      .filter((e) => e.account === 'Revenue')
      .reduce((sum, e) => sum + e.amount, 0);
    const cogs = entries
      .filter((e) => e.account === 'COGS')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue,
      cogs,
      grossProfit: revenue - cogs,
    };
  }
}
