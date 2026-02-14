import { SubCommand, CommandRunner } from 'nest-commander';
import { IntegrationsSyncCommand } from './sync.command.js';

@SubCommand({
  name: 'integrations',
  description: 'Manage 3rd party POS and Vendor integrations',
  subCommands: [IntegrationsSyncCommand],
})
export class IntegrationsCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    if (passedParam.length > 0 && ['sync'].includes(passedParam[0])) {
      return;
    }
    console.log('Use a subcommand: sync');
  }
}
