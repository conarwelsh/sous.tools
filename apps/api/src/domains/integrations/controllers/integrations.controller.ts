import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IntegrationsService } from '../services/integrations.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('connect')
  async connect(@Body() body: { provider: string; credentials: any }, @Req() req: any) {
    await this.integrationsService.connect(req.user.orgId, body.provider, body.credentials);
    return { status: 'connected' };
  }

  @Post('sync')
  async sync(@Body() body: { provider: string }, @Req() req: any) {
    return this.integrationsService.sync(req.user.orgId, body.provider);
  }
}
