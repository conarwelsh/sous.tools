import { Module } from '@nestjs/common';
import { IntegrationsService } from './services/integrations.service.js';
import { IntegrationsController } from './controllers/integrations.controller.js';
import { DriverFactory } from './drivers/driver.factory.js';

@Module({
  providers: [IntegrationsService, DriverFactory],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
