import { Module } from '@nestjs/common';
import { PresentationService } from './services/presentation.service.js';
import { PresentationController } from './controllers/presentation.controller.js';
import { PublicPresentationController } from './controllers/public-presentation.controller.js';
import { PresentationResolver } from './resolvers/presentation.resolver.js';
import { AuthModule } from '../iam/auth/auth.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [AuthModule],
  providers: [PresentationService],
  controllers: [PresentationController, PublicPresentationController],
  exports: [PresentationService],
})
export class PresentationModule {}
