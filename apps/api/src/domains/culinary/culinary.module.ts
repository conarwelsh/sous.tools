import { Module } from '@nestjs/common';
import { CulinaryService } from './services/culinary.service.js';
import { CulinaryController } from './controllers/culinary.controller.js';
import { CulinaryResolver } from './resolvers/culinary.resolver.js';

@Module({
  providers: [CulinaryService, CulinaryResolver],
  controllers: [CulinaryController],
  exports: [CulinaryService],
})
export class CulinaryModule {}
