import { Module } from '@nestjs/common';
import { PresentationService } from './services/presentation.service.js';
import { PresentationController } from './controllers/presentation.controller.js';
import { PublicPresentationController } from './controllers/public-presentation.controller.js';
import { PresentationResolver, PresentationDisplayResolver } from './resolvers/presentation.resolver.js';
import { AuthModule } from '../iam/auth/auth.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { CoreModule } from '../core/core.module.js';
import { CulinaryModule } from '../culinary/culinary.module.js';

@Module({
  imports: [AuthModule, CulinaryModule],
  providers: [PresentationService, PresentationResolver, PresentationDisplayResolver],
  controllers: [PresentationController, PublicPresentationController],
  exports: [PresentationService],
})
export class PresentationModule {}
