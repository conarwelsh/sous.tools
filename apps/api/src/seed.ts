import { NestFactory } from '@nestjs/core';
import { MaintenanceModule } from './domains/maintenance/maintenance.module.js';
import { SeederService } from './domains/maintenance/services/seeder.service.js';
import { config } from '@sous/config';
import { logger } from '@sous/logger';

async function bootstrap() {
  logger.info('🚀 Bootstrapping Seeder Application Context...');
  try {
    const app = await NestFactory.createApplicationContext(MaintenanceModule);
    logger.info('✅ Application Context Created.');
    
    await app.init();
    logger.info('✅ Application Context Initialized.');

    const seeder = app.get(SeederService);

    const type = process.argv[2] || 'system';
    logger.info(`🌱 Starting seed process: ${type}`);

    if (type === 'system') {
      await seeder.seedSystem();
    } else if (type === 'sample') {
      await seeder.seedSystem();
      await seeder.seedSample();
    }

    logger.info('✨ Seeding complete.');
    await app.close();
    process.exit(0);
  } catch (error: any) {
    console.error('CRITICAL ERROR DURING BOOTSTRAP:', error);
    process.exit(1);
  }
}

bootstrap();
