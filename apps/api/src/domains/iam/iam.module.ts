import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [AuthModule, InvitationsModule, UsersModule],
  providers: [],
  controllers: [],
  exports: [AuthModule, InvitationsModule, UsersModule],
})
export class IamModule {}
