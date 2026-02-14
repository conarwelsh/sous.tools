import { Controller, Post, Body, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { PosService } from '../services/pos.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { IdempotencyInterceptor } from '../../core/interceptors/idempotency.interceptor.js';

@Controller('pos')
@UseGuards(JwtAuthGuard)
@UseInterceptors(IdempotencyInterceptor)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('ledger/open')
  async openLedger(@Body() body: { locationId: string; startingCash: number }, @Req() req: any) {
    return this.posService.openLedger(req.user.organizationId, body.locationId, body.startingCash);
  }

  @Post('ledger/close')
  async closeLedger(@Body() body: { ledgerId: string; actualCash: number }) {
    return this.posService.closeLedger(body.ledgerId, body.actualCash);
  }

  @Post('sale')
  async recordSale(@Body() body: { orderData: any; ledgerId: string }, @Req() req: any) {
    return this.posService.recordSale(req.user.organizationId, body.orderData, body.ledgerId);
  }
}
