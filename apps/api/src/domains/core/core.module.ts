import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller.js';
import { PlatformController } from './controllers/platform.controller.js';
import { AppService } from './app.service.js';
import { PlatformService } from './services/platform.service.js';
import { CacheService } from './services/cache.service.js';
import { DatabaseService } from './database/database.service.js';
import { MailService } from './mail/mail.service.js';
import { EmailProcessor } from './mail/email.processor.js';
import { DashboardResolver } from './resolvers/dashboard.resolver.js';
import { config } from '@sous/config';

const skipMail = process.env.SKIP_MAIL === 'true';
const skipBull = process.env.SKIP_BULL === 'true';

@Global()
@Module({
  imports: [
    ...(skipMail || skipBull
      ? []
      : [
          BullModule.forRootAsync({
            useFactory: () => {
              const redisUrl = new URL(
                config.redis.url || 'redis://127.0.0.1:6380',
              );
              return {
                connection: {
                  host: redisUrl.hostname,
                  port: Number(redisUrl.port),
                  maxRetriesPerRequest: null,
                },
                defaultJobOptions: {
                  removeOnComplete: true,
                },
              };
            },
          }),
          BullModule.registerQueue({
            name: 'email-queue',
          }),
        ]),
  ],
  providers: [
    AppService,
    DatabaseService,
    PlatformService,
    CacheService,
    ...(skipMail || skipBull ? [] : [MailService, EmailProcessor]),
    DashboardResolver,
  ],
  controllers: [AppController, PlatformController],
  exports: [
    AppService,
    DatabaseService,
    PlatformService,
    CacheService,
    ...(skipMail || skipBull ? [] : [MailService]),
  ],
})
export class CoreModule {}
