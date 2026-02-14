import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SalesService } from './services/sales.service.js';
import { CommissionProcessor } from './services/commission.processor.js';
import { SalesController } from './controllers/sales.controller.js';
import { CoreModule } from '../core/core.module.js';
import { AuthModule } from '../iam/auth/auth.module.js';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'sales-queue',
    }),
  ],
  providers: [SalesService, CommissionProcessor],
  controllers: [SalesController],
  exports: [SalesService],
})
export class SalesModule {}
