import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createInvitation(@Body() body: any, @Req() req: any) {
    return this.invitationsService.createInvitation({
      email: body.email,
      role: body.role || 'user',
      organizationId: req.user.orgId,
      invitedById: req.user.sub,
    });
  }

  @Get('validate')
  async validateInvitation(@Query('token') token: string) {
    return this.invitationsService.validateInvitation(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getInvitations(@Req() req: any) {
    return this.invitationsService.listInvitations(req.user.orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/revoke')
  async revokeInvitation(@Req() req: any, @Param('id') id: string) {
    return this.invitationsService.revokeInvitation(id, req.user.orgId);
  }
}
