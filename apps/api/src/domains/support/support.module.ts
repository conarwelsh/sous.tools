import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SupportService } from './services/support.service.js';
import { SupportProcessor } from './services/support.processor.js';
import { SupportController } from './controllers/support.controller.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [
    CoreModule,
    BullModule.registerQueue({
      name: 'support-queue',
    }),
  ],
  providers: [SupportService, SupportProcessor],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
