import { Module } from '@nestjs/common';
import { CoreModule } from './domains/core/core.module.js';
import { IamModule } from './domains/iam/iam.module.js';
import { MediaModule } from './domains/media/media.module.js';
import { PresentationModule } from './domains/presentation/presentation.module.js';
import { RealtimeModule } from './domains/realtime/realtime.module.js';

@Module({
  imports: [
    CoreModule,
    IamModule,
    MediaModule,
    PresentationModule,
    RealtimeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
