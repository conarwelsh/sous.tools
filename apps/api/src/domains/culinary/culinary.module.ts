import { Module, forwardRef } from '@nestjs/common';
import { CulinaryService } from './services/culinary.service.js';
import { CulinaryController } from './controllers/culinary.controller.js';
import { CulinaryResolver } from './resolvers/culinary.resolver.js';
import { IngestionModule } from '../ingestion/ingestion.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [IngestionModule, forwardRef(() => IntegrationsModule), CoreModule],
  providers: [CulinaryService, CulinaryResolver],
  controllers: [CulinaryController],
  exports: [CulinaryService],
})
export class CulinaryModule {}
