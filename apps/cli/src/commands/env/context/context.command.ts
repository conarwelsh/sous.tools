import { Command, CommandRunner } from 'nest-commander';
import { WhoamiCommand } from './whoami.command.js';
import { SwitchEnvCommand } from './switch-env.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'context',
  description: 'Manage CLI target context (org, environment, user)',
  subCommands: [WhoamiCommand, SwitchEnvCommand],
})
export class ContextCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['whoami', 'switch-env'].includes(passedParam[0])
    ) {
      return;
    }
    logger.info('Please specify a subcommand: whoami, switch-env');
  }
}
