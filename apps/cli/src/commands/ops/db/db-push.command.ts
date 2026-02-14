import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';
import { config } from '@sous/config';

@SubCommand({
  name: 'push',
  description: 'Push schema changes to the database',
})
export class DbPushCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🚀 Pushing schema to database...');
    try {
      if (!config.db.url) {
        throw new Error('Database URL not found in config');
      }

      execSync('pnpm --filter @sous/api run db:push', {
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: config.db.url,
        },
      });
      logger.info('✅ Database schema updated successfully');
    } catch (error: any) {
      logger.error(`❌ Failed to push schema to database: ${error.message}`);
      process.exit(1);
    }
  }
}
