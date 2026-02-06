import { Module } from '@nestjs/common';
import { IntegrationsService } from './services/integrations.service.js';
import { IntegrationsController } from './controllers/integrations.controller.js';

@Module({
  providers: [IntegrationsService],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
