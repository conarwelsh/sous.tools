import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { CliConfigService } from '../../services/cli-config.service.js';
import chalk from 'chalk';

@SubCommand({
  name: 'switch-org',
  description: 'Switch the active organization context',
})
export class SwitchOrgCommand extends CommandRunner {
  constructor(private readonly configService: CliConfigService) {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const [orgId] = inputs;

    if (!orgId) {
      logger.error(
        'Organization ID is required. Usage: sous context switch-org <orgId>',
      );
      return;
    }

    await this.configService.setConfig({ currentOrgId: orgId });
    logger.info(`Context switched to Organization ID: ${chalk.cyan(orgId)}`);
  }
}
