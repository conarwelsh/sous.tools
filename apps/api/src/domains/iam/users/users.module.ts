import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { UsersController } from './users.controller.js';
import { UsersResolver } from './resolvers/users.resolver.js';
import { CoreModule } from '../../core/core.module.js';

@Module({
  imports: [CoreModule],
  providers: [UsersService, UsersResolver],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
