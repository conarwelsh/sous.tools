import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service.js';
import { InventoryController } from './controllers/inventory.controller.js';

@Module({
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
