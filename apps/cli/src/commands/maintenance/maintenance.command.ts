import { Command, CommandRunner } from 'nest-commander';
import { HousekeepCommand } from './housekeep/housekeep.command';

@Command({
  name: 'maintenance',
  description: 'System maintenance and cleanup tasks',
  subCommands: [HousekeepCommand],
})
export class MaintenanceCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('Please specify a subcommand: housekeep');
  }
}
