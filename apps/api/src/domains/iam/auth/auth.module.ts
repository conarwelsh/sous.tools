import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { configPromise } from '@sous/config';
import { JwtStrategy } from './guards/jwt.strategy.js';
import { LocalStrategy } from './guards/local.strategy.js';
import { SessionService } from './services/session.service.js';
import { CoreModule } from '../../core/core.module.js';

@Global()
@Module({
  imports: [
    CoreModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => {
        const config = await configPromise;
        if (!config.iam) {
          throw new Error('IAM configuration is missing');
        }
        return {
          secret: config.iam.jwtSecret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, SessionService],
})
export class AuthModule {}
