import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IntelligenceService } from './services/intelligence.service.js';
import { CostingService } from './services/costing.service.js';
import { PriceTrendService } from './services/price-trend.service.js';
import { DataPruningService } from './services/data-pruning.service.js';
import { IntelligenceProcessor } from './services/intelligence.processor.js';
import { IntelligenceController } from './controllers/intelligence.controller.js';
import { configPromise } from '@sous/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => {
        const config = await configPromise;
        return {
          connection: {
            url: config.redis.url,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'intelligence',
    }),
  ],
  providers: [
    IntelligenceService,
    CostingService,
    PriceTrendService,
    DataPruningService,
    IntelligenceProcessor,
  ],
  controllers: [IntelligenceController],
  exports: [IntelligenceService, CostingService, PriceTrendService],
})
export class IntelligenceModule {}
