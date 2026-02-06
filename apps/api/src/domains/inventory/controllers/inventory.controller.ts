import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('ledger')
  async getLedger(@Req() req: any, @Query('locationId') locationId?: string) {
    return this.inventoryService.getLedger(req.user.organizationId, locationId);
  }

  @Post('movement')
  async recordMovement(@Body() body: any, @Req() req: any) {
    return this.inventoryService.recordMovement({
      ...body,
      organizationId: req.user.organizationId,
    });
  }
}
