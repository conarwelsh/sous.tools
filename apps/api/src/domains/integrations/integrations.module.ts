import { Module, forwardRef } from '@nestjs/common';
import { IntegrationsService } from './services/integrations.service.js';
import { IntegrationsController } from './controllers/integrations.controller.js';
import { DriverFactory } from './drivers/driver.factory.js';
import { CulinaryModule } from '../culinary/culinary.module.js';
import { IngestionModule } from '../ingestion/ingestion.module.js';

@Module({
  imports: [forwardRef(() => CulinaryModule), IngestionModule],
  providers: [IntegrationsService, DriverFactory],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
