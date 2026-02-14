import { Command, CommandRunner } from 'nest-commander';
import { HousekeepCommand } from './housekeep/housekeep.command.js';
import { DbCommand } from './db/db.command.js';
import { KillCommand } from './kill.command.js';
import { ShellInstallCommand } from './shell-install.command.js';

@Command({
  name: 'ops',
  description: 'Operations and system maintenance tasks',
  subCommands: [HousekeepCommand, DbCommand, KillCommand, ShellInstallCommand],
})
export class OpsCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['housekeep', 'db', 'kill', 'shell-install'].includes(passedParam[0])
    ) {
      return;
    }
    this.command.help();
  }
}
