import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IngestionService } from './services/ingestion.service.js';
import { IngestionProcessor } from './services/ingestion.processor.js';
import { CoreModule } from '../core/core.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';

@Module({
  imports: [
    CoreModule,
    forwardRef(() => IntegrationsModule),
    BullModule.registerQueue({
      name: 'ingestion-queue',
    }),
  ],
  providers: [IngestionService, IngestionProcessor],
  controllers: [],
  exports: [IngestionService, BullModule],
})
export class IngestionModule {}
