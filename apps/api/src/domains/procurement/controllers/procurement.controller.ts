import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProcurementService } from '../services/procurement.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('procurement')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('suppliers')
  async getSuppliers(@Req() req: any) {
    return this.procurementService.getSuppliers(req.user.organizationId);
  }

  @Post('suppliers')
  async createSupplier(@Body() body: any, @Req() req: any) {
    return this.procurementService.createSupplier({
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Get('invoices')
  async getInvoices(@Req() req: any) {
    return this.procurementService.getInvoices(req.user.organizationId);
  }

  @Post('invoices')
  async createInvoice(@Body() body: any, @Req() req: any) {
    const { items, ...invoiceData } = body;
    return this.procurementService.createInvoice(
      { ...invoiceData, organizationId: req.user.organizationId },
      items || [],
    );
  }
}
