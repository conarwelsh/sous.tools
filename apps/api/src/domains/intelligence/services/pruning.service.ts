import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { logger } from '@sous/logger';
import { DatabaseService } from '../../core/database/database.service.js';
import { telemetry, reports } from '../../core/database/schema.js';
import { sql, lt } from 'drizzle-orm';

@Injectable()
export class PruningService {
  constructor(private readonly dbService: DatabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOldData() {
    logger.info('🧹 Starting scheduled data pruning...');

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // 1. Telemetry Logs (7 days)
      const telemetryResult = await this.dbService.db
        .delete(telemetry)
        .where(lt(telemetry.createdAt, sevenDaysAgo));

      // 2. Historical Reports (90 days)
      const reportsResult = await this.dbService.db
        .delete(reports)
        .where(lt(reports.createdAt, ninetyDaysAgo));

      logger.info('✅ Data pruning complete.');
    } catch (error) {
      logger.error('❌ Data pruning failed', error);
    }
  }
}
