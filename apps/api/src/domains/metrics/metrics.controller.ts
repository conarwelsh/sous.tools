import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../iam/auth/guards/roles.guard.js';
import { Roles } from '../iam/auth/decorators/roles.decorator.js';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('platform')
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  async getPlatformMetrics() {
    return this.metricsService.getPlatformMetrics();
  }

  @Get('daily-sales')
  async getDailySales(@Req() req: any) {
    return this.metricsService.getDailySales(req.user.organizationId);
  }

  @Get('recipes-count')
  async getRecipesCount(@Req() req: any) {
    return this.metricsService.getRecipesCount(req.user.organizationId);
  }

  @Get('ingredients-count')
  async getIngredientsCount(@Req() req: any) {
    return this.metricsService.getIngredientsCount(req.user.organizationId);
  }

  @Get('pending-invoices')
  async getPendingInvoicesCount(@Req() req: any) {
    return this.metricsService.getPendingInvoicesCount(req.user.organizationId);
  }

  @Get('connected-nodes')
  async getConnectedNodesCount(@Req() req: any) {
    return this.metricsService.getConnectedNodesCount(req.user.organizationId);
  }
}
