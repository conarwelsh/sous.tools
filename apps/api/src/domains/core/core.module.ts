import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseService } from './database/database.service.js';
import { DashboardResolver } from './resolvers/dashboard.resolver.js';

@Global()
@Module({
  providers: [AppService, DatabaseService, DashboardResolver],
  controllers: [AppController],
  exports: [AppService, DatabaseService],
})
export class CoreModule {}
