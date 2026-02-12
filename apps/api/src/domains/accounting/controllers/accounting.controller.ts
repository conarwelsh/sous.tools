import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AccountingService } from '../services/accounting.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('ledger')
  async getLedger(@Req() req: any) {
    return this.accountingService.getLedger(req.user.organizationId);
  }

  @Get('pl')
  async getPL(@Req() req: any) {
    return this.accountingService.generatePL(req.user.organizationId);
  }
}
