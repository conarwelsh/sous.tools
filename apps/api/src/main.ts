import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configPromise } from '@sous/config';
import { logger } from '@sous/logger';

async function bootstrap() {
  const config = await configPromise;
  const app = await NestFactory.create(AppModule);

  logger.info(`🚀 API starting on port ${config.api.port}...`);
  await app.listen(config.api.port);
  logger.info(`✅ API is live at http://localhost:${config.api.port}`);
}
bootstrap();
