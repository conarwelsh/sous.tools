import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { BillingService } from '../services/billing.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Body() body: { planSlug: string; provider?: string }, @Req() req: any) {
    return this.billingService.subscribe(req.user.organizationId, body.planSlug, body.provider);
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Req() req: any) {
    return this.billingService.getSubscription(req.user.organizationId);
  }
}
