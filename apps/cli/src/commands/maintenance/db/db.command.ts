import { Command, CommandRunner } from 'nest-commander';
import { DbPushCommand } from './db-push.command.js';
import { DbUpCommand } from './db-up.command.js';
import { DbDownCommand } from './db-down.command.js';
import { DbResetCommand } from './db-reset.command.js';
import { RemoteResetCommand } from './remote-reset.command.js';
import { SeedCommand } from './seed.command.js';

@Command({
  name: 'db',
  description: 'Database maintenance commands',
  subCommands: [
    DbPushCommand,
    DbUpCommand,
    DbDownCommand,
    DbResetCommand,
    RemoteResetCommand,
    SeedCommand,
  ],
})
export class DbCommand extends CommandRunner {
  async run(): Promise<void> {
    this.command.help();
  }
}
