import { Module } from '@nestjs/common';
import { IngestionService } from './services/ingestion.service.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
