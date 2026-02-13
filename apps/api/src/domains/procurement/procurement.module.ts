import { Module } from '@nestjs/common';
import { ProcurementService } from './services/procurement.service.js';
import { ProcurementController } from './controllers/procurement.controller.js';
import { ProcurementResolver } from './resolvers/procurement.resolver.js';

@Module({
  providers: [ProcurementService, ProcurementResolver],
  controllers: [ProcurementController],
  exports: [ProcurementService],
})
export class ProcurementModule {}
