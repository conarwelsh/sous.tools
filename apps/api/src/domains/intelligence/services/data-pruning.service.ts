import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../core/database/database.service.js';
import { telemetry } from '../../core/database/schema.js';
import { lt } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class DataPruningService {
  constructor(private readonly dbService: DatabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneTelemetry() {
    logger.info('🧹 Pruning old telemetry data...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await this.dbService.db
      .delete(telemetry)
      .where(lt(telemetry.createdAt, sevenDaysAgo));

    logger.info(`✅ Pruned telemetry records.`);
  }

  // BullMQ job pruning is handled by BullMQ options, but we can add more logic here.
}
