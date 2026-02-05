import { Command, CommandRunner } from 'nest-commander';
import { DbPushCommand } from './db-push.command.js';

@Command({
  name: 'db',
  description: 'Database maintenance commands',
  subCommands: [DbPushCommand],
})
export class DbCommand extends CommandRunner {
  async run(): Promise<void> {
    this.command.help();
  }
}
