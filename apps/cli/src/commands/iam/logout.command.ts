import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import { CliConfigService } from '../../services/cli-config.service.js';

@SubCommand({
  name: 'logout',
  description: 'Log out from the Sous API and clear local session',
})
export class LogoutCommand extends CommandRunner {
  constructor(private readonly configService: CliConfigService) {
    super();
  }

  async run(): Promise<void> {
    await this.configService.clearConfig();
    logger.info('Successfully logged out and cleared local context.');
  }
}
