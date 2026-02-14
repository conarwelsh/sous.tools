import { Module } from '@nestjs/common';
import { OAuthService } from './services/oauth.service.js';
import { OAuthController } from './controllers/oauth.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { CoreModule } from '../../core/core.module.js';

@Module({
  imports: [AuthModule, CoreModule],
  providers: [OAuthService],
  controllers: [OAuthController],
  exports: [OAuthService],
})
export class OAuthModule {}
