import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseService } from './database/database.service.js';
import { MailService } from './mail/mail.service.js';
import { EmailProcessor } from './mail/email.processor.js';
import { DashboardResolver } from './resolvers/dashboard.resolver.js';
import { config } from '@sous/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = new URL(config.redis.url || 'redis://localhost:6380');
        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port),
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [
    AppService,
    DatabaseService,
    MailService,
    EmailProcessor,
    DashboardResolver,
  ],
  controllers: [AppController],
  exports: [AppService, DatabaseService, MailService],
})
export class CoreModule {}
