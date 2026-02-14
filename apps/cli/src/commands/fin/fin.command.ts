import { Command, CommandRunner } from 'nest-commander';
import { IntelCostCommand } from './intel-cost.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'fin',
  description: 'Financial and business intelligence reporting',
  subCommands: [IntelCostCommand],
})
export class FinCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['cost'].includes(passedParam[0])) {
      return;
    }
    logger.info('Please specify a subcommand: cost');
  }
}
