import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { config } from '@sous/config';
import { JwtStrategy } from './guards/jwt.strategy.js';
import { LocalStrategy } from './guards/local.strategy.js';
import { SessionService } from './services/session.service.js';
import { CoreModule } from '../../core/core.module.js';
import { HardwareAuthGuard } from '../../hardware/guards/hardware-auth.guard.js';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: config.iam.jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionService, HardwareAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, SessionService, HardwareAuthGuard],
})
export class AuthModule {}
