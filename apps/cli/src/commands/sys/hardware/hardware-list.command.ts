import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import { CliConfigService } from '../../../services/cli-config.service.js';
import { getHttpClient } from '@sous/client-sdk';
import chalk from 'chalk';

@SubCommand({
  name: 'list',
  description: 'List all paired devices and their current status',
})
export class HardwareListCommand extends CommandRunner {
  constructor(private readonly configService: CliConfigService) {
    super();
  }

  async run(): Promise<void> {
    const cliConfig = await this.configService.getConfig();

    if (!cliConfig.token) {
      logger.error(
        'You must be logged in to view hardware. Run "sous context login" first.',
      );
      return;
    }

    logger.info(`🔍 Querying hardware nodes for organization...`);

    try {
      const client = await getHttpClient();
      client.setToken(cliConfig.token);

      const devices: any[] = await client.get('/hardware');

      if (devices.length === 0) {
        logger.warn('No devices found for this organization.');
        return;
      }

      console.log('\n' + chalk.bold('📟 PAIRED DEVICES'));
      console.log('='.repeat(80));
      console.log(
        `${chalk.bold('ID'.padEnd(38))} ${chalk.bold('NAME'.padEnd(20))} ${chalk.bold('TYPE'.padEnd(10))} ${chalk.bold('STATUS')}`,
      );

      for (const device of devices) {
        const statusColor =
          device.status === 'online' ? chalk.green : chalk.gray;
        console.log(
          `${device.id.padEnd(38)} ${device.name.padEnd(20)} ${device.type.padEnd(10)} ${statusColor(device.status.toUpperCase())}`,
        );
      }

      console.log('='.repeat(80) + '\n');
    } catch (error: any) {
      logger.error(`Failed to fetch hardware list: ${error.message}`);
    }
  }
}
