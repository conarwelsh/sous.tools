import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SupportService, SupportReport } from '../services/support.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('report')
  @UseGuards(JwtAuthGuard)
  async report(@Body() data: SupportReport, @Req() req: any) {
    // Inject metadata from request if not provided
    const report: SupportReport = {
      ...data,
      metadata: {
        ...data.metadata,
        orgId: req.user.organizationId,
        userId: req.user.sub || req.user.id,
      },
    };

    return this.supportService.report(report);
  }
}
