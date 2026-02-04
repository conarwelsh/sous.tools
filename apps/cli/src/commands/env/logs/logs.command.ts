import { Command, CommandRunner } from 'nest-commander';
import { LogsTailCommand } from './logs-tail.command';
import { LogsWipeCommand } from './logs-wipe.command';

@Command({
  name: 'logs',
  description: 'Manage and view logs',
  subCommands: [LogsTailCommand, LogsWipeCommand],
})
export class LogsCommand extends CommandRunner {
  async run(): Promise<void> {
    // If no subcommand is provided, show help
    // nest-commander usually handles this, but we can print a message
    console.log('Please specify a subcommand: tail, wipe');
  }
}
