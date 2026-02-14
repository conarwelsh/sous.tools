import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { OAuthModule } from './oauth/oauth.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { UsersModule } from './users/users.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { PlanService } from './organizations/services/plan.service.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [AuthModule, OAuthModule, InvitationsModule, UsersModule, LocationsModule, CoreModule],
  providers: [PlanService],
  controllers: [],
  exports: [AuthModule, OAuthModule, InvitationsModule, UsersModule, LocationsModule, PlanService],
})
export class IamModule {}
