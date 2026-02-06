import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'reset',
  description: 'Reset local database infrastructure (Down -> Up -> Push)',
})
export class DbResetCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🔄 Resetting database infrastructure...');
    try {
      execSync('pnpm db:reset', { stdio: 'inherit' });
      logger.info('✅ Database reset successfully.');
    } catch (error) {
      logger.error('❌ Database reset failed.');
    }
  }
}
