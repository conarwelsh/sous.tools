import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/services/users.service.js';
import { localConfig } from '@sous/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: localConfig.iam?.jwtSecret || 'sous-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, UsersService],
  exports: [AuthService, UsersService, JwtModule],
})
export class AuthModule {}
