import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { configPromise } from '@sous/config';
import { JwtStrategy } from './guards/jwt.strategy.js';
import { LocalStrategy } from './guards/local.strategy.js';

@Global()
@Module({
  imports: [
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
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}