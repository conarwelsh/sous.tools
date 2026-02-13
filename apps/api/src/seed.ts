import { NestFactory } from '@nestjs/core';
import { MaintenanceModule } from './domains/maintenance/maintenance.module.js';
import { SeederService } from './domains/maintenance/services/seeder.service.js';
import { resolveConfig } from '@sous/config';
import { logger } from '@sous/logger';

async function bootstrap() {
  const config = await resolveConfig();
  logger.info('🚀 Bootstrapping Seeder Application Context...');
  try {
    const app = await NestFactory.createApplicationContext(MaintenanceModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    await app.init();
    logger.info('✅ Application Context Created and Initialized.');

    const seeder = app.get(SeederService);

    const type = process.argv[2] || 'system';
    logger.info(`🌱 Starting seed process: ${type}`);

    if (type === 'system') {
      await seeder.seedSystem();
    } else if (type === 'sample') {
      await seeder.seedSystem();
      await seeder.seedSample();
    } else {
      logger.error(`Unknown seed type: ${type}. Use 'system' or 'sample'.`);
      process.exit(1);
    }
    logger.info('✨ Seeding process finished successfully.');
    await app.close();
    process.exit(0);
  } catch (error: any) {
    console.error('CRITICAL ERROR DURING BOOTSTRAP:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('FATAL ERROR:');
  console.error(err);
  process.exit(1);
});
