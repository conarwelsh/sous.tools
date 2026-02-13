import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'reset',
  description:
    'Reset local database infrastructure (Stop -> Remove -> Start -> Push -> Seed)',
})
export class DbResetCommand extends CommandRunner {
  async run(): Promise<void> {
    logger.info('🔄 Resetting database infrastructure...');

    const runCommand = (cmd: string) => {
      logger.info(`  └─ Running: ${cmd}`);
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch (e: any) {
        logger.error(`❌ Command failed: ${cmd}`);
        throw e;
      }
    };

    try {
      logger.info('  └─ Stopping postgres and removing its volume...');
      runCommand('docker compose stop postgres');
      runCommand('docker compose rm -f postgres');
      runCommand('docker volume rm -f soustools_postgres_data');

      logger.info('  └─ Starting postgres...');
      runCommand('docker compose up -d postgres');

      logger.info('  └─ Waiting for database to be ready (10s)...');
      await new Promise((resolve) => setTimeout(resolve, 10000));

      logger.info('  └─ Pushing schema...');
      runCommand('pnpm --filter @sous/api run db:push');

      logger.info('  └─ Seeding database (system + sample)...');
      runCommand('pnpm --filter @sous/api run db:seed sample');

      logger.info('✅ Database reset and seeded with sample data successfully.');
    } catch (error: any) {
      logger.error(`❌ Database reset failed: ${error.message}`);
      process.exit(1);
    } finally {
      process.exit(0);
    }
  }
}
