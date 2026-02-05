import { Command, CommandRunner } from 'nest-commander';
import { HousekeepCommand } from './housekeep/housekeep.command.js';
import { DbCommand } from './db/db.command.js';

@Command({
  name: 'maintenance',
  description: 'System maintenance and cleanup tasks',
  subCommands: [HousekeepCommand, DbCommand],
})
export class MaintenanceCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (
      passedParam.length > 0 &&
      ['housekeep', 'db'].includes(passedParam[0])
    ) {
      return;
    }
    console.log('Please specify a subcommand: housekeep, db');
  }
}
