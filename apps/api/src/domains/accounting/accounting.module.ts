import { Module } from '@nestjs/common';
import { AccountingService } from './services/accounting.service.js';
import { AccountingController } from './controllers/accounting.controller.js';

@Module({
  providers: [AccountingService],
  controllers: [AccountingController],
  exports: [AccountingService],
})
export class AccountingModule {}
