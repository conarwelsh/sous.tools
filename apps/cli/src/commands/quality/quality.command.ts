import { Command, CommandRunner } from 'nest-commander';
import { TestCommand } from './test/test.command';
import { CheckCommand } from './check/check.command';

@Command({
  name: 'quality',
  description: 'Code quality and testing tools',
  subCommands: [TestCommand, CheckCommand],
})
export class QualityCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('Please specify a subcommand: test, check');
  }
}
