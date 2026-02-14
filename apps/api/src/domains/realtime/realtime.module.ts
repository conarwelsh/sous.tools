import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway.js';
import { AuthModule } from '../iam/auth/auth.module.js';

const skipGateways = process.env.SKIP_GATEWAYS === 'true';

@Global()
@Module({
  imports: [AuthModule],
  providers: skipGateways ? [] : [RealtimeGateway],
  exports: skipGateways ? [] : [RealtimeGateway],
})
export class RealtimeModule {}
