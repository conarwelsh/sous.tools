import { Module } from '@nestjs/common';
import { CulinaryService } from './services/culinary.service.js';
import { CulinaryController } from './controllers/culinary.controller.js';

@Module({
  providers: [CulinaryService],
  controllers: [CulinaryController],
  exports: [CulinaryService],
})
export class CulinaryModule {}
