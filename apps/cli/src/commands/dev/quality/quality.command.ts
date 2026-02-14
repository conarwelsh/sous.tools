import { SubCommand, CommandRunner } from 'nest-commander';
import { TestCommand } from './test/test.command.js';
import { E2ECommand } from './test/e2e.command.js';
import { CheckCommand } from './check/check.command.js';
import { ForgeCommand } from './forge.command.js';
import { AuditCommand } from './audit.command.js';

@SubCommand({
  name: 'quality',
  description: 'Code quality and testing tools',
  subCommands: [
    TestCommand,
    E2ECommand,
    CheckCommand,
    ForgeCommand,
    AuditCommand,
  ],
})
export class QualityCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['test', 'e2e', 'check', 'forge', 'audit'].includes(passedParam[0])
    ) {
      return;
    }
    console.log('Please specify a subcommand: test, e2e, check, forge, audit');
  }
}
