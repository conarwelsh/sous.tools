import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway.js';
import { AuthModule } from '../iam/auth/auth.module.js';
import { PubSub } from 'graphql-subscriptions';

const skipGateways = process.env.SKIP_GATEWAYS === 'true';

@Global()
@Module({
  imports: [AuthModule],
  providers: [
    ...(skipGateways ? [] : [RealtimeGateway]),
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [...(skipGateways ? [] : [RealtimeGateway]), 'PUB_SUB'],
})
export class RealtimeModule {}
