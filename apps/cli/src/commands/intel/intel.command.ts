import { Command, CommandRunner } from 'nest-commander';
import { IntelCostCommand } from './intel-cost.command.js';
import { logger } from '@sous/logger';

@Command({
  name: 'intel',
  description: 'Business and culinary intelligence reporting',
  subCommands: [IntelCostCommand],
})
export class IntelCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['cost'].includes(passedParam[0])) {
      return;
    }
    logger.info('Please specify a subcommand: cost');
  }
}
