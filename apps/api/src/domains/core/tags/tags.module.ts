import { Module } from '@nestjs/common';
import { TagsController } from './controllers/tags.controller.js';
import { TagsService } from './services/tags.service.js';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
