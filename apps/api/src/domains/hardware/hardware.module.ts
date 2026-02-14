import { Module } from '@nestjs/common';
import { HardwareService } from './services/hardware.service.js';
import { DiscoveryService } from './services/discovery.service.js';
import { RemoteConfigService } from './services/remote-config.service.js';
import { HardwareController } from './controllers/hardware.controller.js';
import { HardwareResolver } from './resolvers/hardware.resolver.js';
import { CoreModule } from '../core/core.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [CoreModule, RealtimeModule],
  providers: [
    HardwareService,
    DiscoveryService,
    RemoteConfigService,
    HardwareResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  controllers: [HardwareController],
  exports: [HardwareService, RemoteConfigService],
})
export class HardwareModule {}
