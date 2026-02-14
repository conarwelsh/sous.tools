import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProcurementService } from '../services/procurement.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { ScopesGuard } from '../../iam/auth/guards/scopes.guard.js';
import { Scopes } from '../../iam/auth/decorators/scopes.decorator.js';
import { FeatureScope } from '@sous/features/constants/plans';

@Controller('procurement')
@UseGuards(JwtAuthGuard, ScopesGuard)
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
  @Scopes(FeatureScope.PROCURE_INVOICE_CREATE)
  async createInvoice(@Body() body: any, @Req() req: any) {
    const { items, ...invoiceData } = body;
    return this.procurementService.createInvoice(
      { ...invoiceData, organizationId: req.user.organizationId },
      items || [],
    );
  }
}
