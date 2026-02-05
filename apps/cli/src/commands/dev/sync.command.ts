import { logger } from '@sous/logger';
import { SubCommand, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';

@SubCommand({
  name: 'sync',
  description: 'Synchronize development environment and dependencies',
})
export class SyncCommand extends CommandRunner {
  // This will eventually be moved to a config file/db
  private targetDevices = [
    '192.168.1.10', // Example RPi
  ];

  async run(
    passedParam: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    logger.info(
      '🔄 Synchronizing development environment across reachable devices...',
    );

    for (const ip of this.targetDevices) {
      logger.info(`\n📡 Checking device: ${ip}...`);
      try {
        // Ping or SSH check
        execSync(`ssh -o ConnectTimeout=2 -o BatchMode=yes ${ip} exit`, {
          stdio: 'ignore',
        });
        logger.info(`✅ ${ip} is ONLINE. Running sync...`);
        execSync(`pnpm sous dev install ${ip}`, { stdio: 'inherit' });
      } catch (error) {
        logger.warn(`⚠️  ${ip} is OFFLINE. Skipping.`);
      }
    }

    logger.info('\n✅ Cross-device sync process finished.');
  }
}
