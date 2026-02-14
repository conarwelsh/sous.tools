import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { SalesService } from '../services/sales.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../iam/auth/guards/roles.guard.js';
import { Roles } from '../../iam/auth/decorators/roles.decorator.js';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('impersonate/:orgId')
  @Roles('salesman', 'superadmin')
  async impersonate(@Param('orgId') orgId: string, @Req() req: any) {
    return this.salesService.impersonate(req.user.sub || req.user.id, orgId);
  }

  @Get('metrics')
  @Roles('salesman', 'superadmin')
  async getMetrics(@Req() req: any) {
    return this.salesService.getMetrics(req.user.sub || req.user.id);
  }

  @Get('organizations')
  @Roles('salesman', 'superadmin')
  async getOrganizations(@Req() req: any) {
    return this.salesService.getAttributedOrganizations(
      req.user.sub || req.user.id,
    );
  }
}
