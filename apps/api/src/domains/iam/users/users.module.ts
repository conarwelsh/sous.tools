import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { UsersController } from './users.controller.js';
import { CoreModule } from '../../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
