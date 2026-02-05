import { Command, CommandRunner } from 'nest-commander';
import { TestCommand } from './test/test.command.js';
import { CheckCommand } from './check/check.command.js';

@Command({
  name: 'quality',
  description: 'Code quality and testing tools',
  subCommands: [TestCommand, CheckCommand],
})
export class QualityCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['test', 'check'].includes(passedParam[0])) {
      return;
    }
    console.log('Please specify a subcommand: test, check');
  }
}
