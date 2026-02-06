import { Module } from '@nestjs/common';
import { ProcurementService } from './services/procurement.service.js';
import { OrderManagerService } from './services/order-manager.service.js';
import { ProcurementController } from './controllers/procurement.controller.js';

@Module({
  providers: [ProcurementService, OrderManagerService],
  controllers: [ProcurementController],
  exports: [ProcurementService, OrderManagerService],
})
export class ProcurementModule {}
