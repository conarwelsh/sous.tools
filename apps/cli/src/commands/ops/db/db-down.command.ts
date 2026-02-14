import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'down',
  description: 'Stop local database infrastructure (Docker)',
})
export class DbDownCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🛑 Stopping database infrastructure...');
    try {
      execSync('pnpm run db:down', { stdio: 'inherit' });
      logger.info('✅ Database is down.');
    } catch (error) {
      logger.error('❌ Failed to stop database.');
    }
  }
}
