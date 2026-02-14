import { Module } from '@nestjs/common';
import { PosService } from './services/pos.service.js';
import { PosController } from './controllers/pos.controller.js';
import { PosResolver } from './resolvers/pos.resolver.js';
import { CoreModule } from '../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [PosService, PosResolver],
  controllers: [PosController],
  exports: [PosService],
})
export class PosModule {}
