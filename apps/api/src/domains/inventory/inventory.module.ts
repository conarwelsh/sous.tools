import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service.js';
import { InventoryController } from './controllers/inventory.controller.js';
import { InventoryResolver } from './resolvers/inventory.resolver.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [InventoryService, InventoryResolver],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
