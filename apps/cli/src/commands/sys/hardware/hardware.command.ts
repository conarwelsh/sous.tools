import { SubCommand, CommandRunner } from 'nest-commander';
import { HardwareListCommand } from './hardware-list.command.js';
import { logger } from '@sous/logger';

@SubCommand({
  name: 'hardware',
  description: 'Manage physical hardware nodes and peripherals',
  subCommands: [HardwareListCommand],
})
export class HardwareCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['list'].includes(passedParam[0])) {
      return;
    }
    logger.info('Please specify a subcommand: list');
  }
}
