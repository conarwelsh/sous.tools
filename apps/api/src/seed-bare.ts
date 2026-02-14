import { DatabaseService } from './domains/core/database/database.service.js';
import { AuthService } from './domains/iam/auth/auth.service.js';
import { MailService } from './domains/core/mail/mail.service.js';
import { config } from '@sous/config';
import { logger } from '@sous/logger';
import { JwtService } from '@nestjs/jwt';

async function run() {
  logger.info('🚀 Starting Bare Seeder...');
  
  const dbService = new DatabaseService();
  dbService.onModuleInit(); // Initialize pools

  const mailService = new MailService(null as any);
  const jwtService = new JwtService({ secret: config.iam.jwtSecret });
  
  const authService = new AuthService(dbService, jwtService, mailService);

  try {
    const type = process.argv[2] || 'system';
    logger.info(`🌱 Seed type: ${type}`);

    const orgId = await authService.seedSystem();
    logger.info(`✅ System seeded. Org ID: ${orgId}`);

    if (type === 'sample') {
      await authService.seedSample();
      logger.info('✅ Sample seeded.');
    }

    logger.info('✨ Bare Seeding complete.');
    await dbService.onModuleDestroy();
    process.exit(0);
  } catch (e) {
    logger.error('❌ Bare Seeding failed', e);
    process.exit(1);
  }
}

run();
