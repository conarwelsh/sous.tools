import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service.js';
import { InvitationsController } from './invitations.controller.js';
import { CoreModule } from '../../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [InvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
