import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseService } from './database/database.service.js';

@Global()
@Module({
  providers: [AppService, DatabaseService],
  controllers: [AppController],
  exports: [AppService, DatabaseService],
})
export class CoreModule {}
