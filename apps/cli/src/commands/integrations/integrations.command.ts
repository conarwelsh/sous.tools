import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'integrations',
  description: 'Manage 3rd party POS and Vendor integrations',
})
export class IntegrationsCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('Use a subcommand: sync, list, connect');
  }
}
