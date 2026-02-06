import { Module } from '@nestjs/common';
import { PresentationService } from './services/presentation.service.js';
import { PresentationController } from './controllers/presentation.controller.js';
import { PresentationSeederService } from './services/seeder.service.js';
import { AuthModule } from '../iam/auth/auth.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [AuthModule, RealtimeModule, CoreModule],
  providers: [PresentationService, PresentationSeederService],
  controllers: [PresentationController],
  exports: [PresentationService],
})
export class PresentationModule {}
