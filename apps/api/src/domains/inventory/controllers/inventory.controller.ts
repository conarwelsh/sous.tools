import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InventoryService } from '../services/inventory.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { ScopesGuard } from '../../iam/auth/guards/scopes.guard.js';
import { Scopes } from '../../iam/auth/decorators/scopes.decorator.js';
import { FeatureScope } from '@sous/features/constants/plans';

@Controller('inventory')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('ledger')
  @Scopes(FeatureScope.INVENTORY_VIEW)
  async getLedger(@Req() req: any, @Query('locationId') locationId?: string) {
    return this.inventoryService.getLedger(req.user.organizationId, locationId);
  }

  @Post('movement')
  @Scopes(FeatureScope.INVENTORY_MANAGE)
  async recordMovement(@Body() body: any, @Req() req: any) {
    return this.inventoryService.recordMovement({
      ...body,
      organizationId: req.user.organizationId,
    });
  }
}
