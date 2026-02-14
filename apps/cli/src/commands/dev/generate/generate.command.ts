import { SubCommand, CommandRunner } from 'nest-commander';
import { DomainGenerateCommand } from './domain.command.js';
import { TacticalGenerateCommand } from './tactical.command.js';
import { UiGenerateCommand } from './ui.command.js';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'generate',
  aliases: ['g'],
  description: 'Scaffold new domains, tactical features, or UI components',
  subCommands: [
    DomainGenerateCommand,
    TacticalGenerateCommand,
    UiGenerateCommand,
  ],
})
export class GenerateCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['domain', 'tactical', 'ui'].includes(passedParam[0])
    ) {
      return;
    }
    logger.info('Please specify a generator: domain, tactical, ui');
  }
}
