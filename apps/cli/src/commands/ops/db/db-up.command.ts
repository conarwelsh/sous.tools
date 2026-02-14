import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'up',
  description: 'Start local database infrastructure (Docker)',
})
export class DbUpCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🐳 Starting database infrastructure...');
    try {
      execSync('pnpm run db:up', { stdio: 'inherit' });
      logger.info('✅ Database is up.');
    } catch (error) {
      logger.error('❌ Failed to start database.');
    }
  }
}
