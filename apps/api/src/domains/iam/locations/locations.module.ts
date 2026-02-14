import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller.js';
import { CoreModule } from '../../core/core.module.js';

@Module({
  imports: [CoreModule],
  controllers: [LocationsController],
  providers: [],
  exports: [],
})
export class LocationsModule {}
