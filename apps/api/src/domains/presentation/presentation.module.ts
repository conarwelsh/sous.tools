import { Module } from '@nestjs/common';
import { PresentationService } from './services/presentation.service.js';
import { PresentationController } from './controllers/presentation.controller.js';
import { AuthModule } from '../iam/auth/auth.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';

@Module({
  imports: [AuthModule, RealtimeModule],
  providers: [PresentationService],
  controllers: [PresentationController],
  exports: [PresentationService],
})
export class PresentationModule {}
