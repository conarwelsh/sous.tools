import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'push',
  description: 'Push schema changes to the database',
})
export class DbPushCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🚀 Pushing schema to database...');
    try {
      execSync('pnpm --filter @sous/api run db:push', { stdio: 'inherit' });
      logger.info('✅ Database schema updated successfully');
    } catch (error) {
      logger.error('❌ Failed to push schema to database');
      process.exit(1);
    }
  }
}
