import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';
import { logger } from '@sous/logger';

interface SeedOptions {
  sample?: boolean;
}

@SubCommand({
  name: 'seed',
  description: 'Seed the database with system or sample data',
})
export class SeedCommand extends CommandRunner {
  async run(passedParam: string[], options?: SeedOptions): Promise<void> {
    const type = options?.sample ? 'sample' : 'system';

    logger.info(`🌱 Running ${type} seed...`);

    try {
      execSync(`pnpm --filter @sous/api run db:seed ${type}`, {
        stdio: 'inherit',
      });
      logger.info('✅ Database seeded successfully.');
    } catch (e) {
      logger.error('❌ Database seeding failed.');
    }
  }

  @Option({
    flags: '-s, --sample',
    description: 'Load sample development data',
  })
  parseSample(): boolean {
    return true;
  }
}
