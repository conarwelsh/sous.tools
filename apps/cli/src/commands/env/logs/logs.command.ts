import { SubCommand, CommandRunner } from 'nest-commander';
import { LogsTailCommand } from './logs-tail.command.js';
import { LogsWipeCommand } from './logs-wipe.command.js';

@SubCommand({
  name: 'logs',
  description: 'Manage and view logs',
  subCommands: [LogsTailCommand, LogsWipeCommand],
})
export class LogsCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['tail', 'wipe'].includes(passedParam[0])) {
      return;
    }
    console.log('Please specify a subcommand: tail, wipe');
  }
}