import { Command, CommandRunner } from 'nest-commander';
import { ConfigCommand } from './config/config.command.js';
import { LogsCommand } from './logs/logs.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'env',
  description: 'Infrastructure and environment management',
  subCommands: [ConfigCommand, LogsCommand],
})
export class EnvCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['config', 'logs'].includes(passedParam[0])) {
      return;
    }
    logger.info('Please specify a subcommand: config, logs');
  }
}
